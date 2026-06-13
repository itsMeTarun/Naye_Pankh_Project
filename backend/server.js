import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'super-secret-volosphere-key-2026';

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware: Authenticate Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware: Require Admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Administrator privileges required' });
  }
};

// --- AUTHENTICATION ROUTES ---

// Public: Register Volunteer
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, skills, availability, interests, bio } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Create User record
    const user = await db.createUser({
      email,
      passwordHash,
      role: 'volunteer',
      name
    });

    // Create Volunteer profile linked to user
    const volunteer = await db.createVolunteer({
      userId: user.id,
      name,
      phone: phone || '',
      skills: skills || [],
      availability: availability || 'Weekends',
      interests: interests || [],
      bio: bio || ''
    });

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
      volunteer
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// Public: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    let volunteer = null;
    if (user.role === 'volunteer') {
      volunteer = await db.getVolunteerByUserId(user.id);
    }

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
      volunteer
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// Authenticated: Get Me
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const allUsers = await db.getUsers();
    const userRecord = allUsers.find(u => u.id === req.user.id);
    if (!userRecord) {
      return res.status(404).json({ message: 'User not found' });
    }

    let volunteer = null;
    if (userRecord.role === 'volunteer') {
      volunteer = await db.getVolunteerByUserId(userRecord.id);
    }

    res.json({
      user: { id: userRecord.id, email: userRecord.email, role: userRecord.role, name: userRecord.name },
      volunteer
    });
  } catch (error) {
    console.error('Get Me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// --- PUBLIC DRIVES ROUTES ---

// Public: Get all drives
app.get('/api/opportunities', async (req, res) => {
  try {
    const opps = await db.getOpportunities();
    res.json(opps);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve opportunities' });
  }
});


// --- VOLUNTEER ROUTES ---

// Helper to check and retrieve volunteer profile
const getReqVolunteer = async (req, res, next) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Required volunteer role' });
    }
    const vol = await db.getVolunteerByUserId(req.user.id);
    if (!vol) {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }
    req.volunteer = vol;
    next();
  } catch (error) {
    console.error('Middleware helper volunteer error:', error);
    res.status(500).json({ message: 'Internal middleware retrieval error' });
  }
};

// Volunteer: Get profile
app.get('/api/volunteer/profile', authenticateToken, getReqVolunteer, (req, res) => {
  res.json(req.volunteer);
});

// Volunteer: Update profile
app.post('/api/volunteer/profile', authenticateToken, getReqVolunteer, async (req, res) => {
  try {
    const { phone, skills, availability, interests, bio } = req.body;
    const updated = await db.updateVolunteer(req.volunteer.id, {
      phone: phone !== undefined ? phone : req.volunteer.phone,
      skills: skills !== undefined ? skills : req.volunteer.skills,
      availability: availability !== undefined ? availability : req.volunteer.availability,
      interests: interests !== undefined ? interests : req.volunteer.interests,
      bio: bio !== undefined ? bio : req.volunteer.bio
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Volunteer: View application history
app.get('/api/volunteer/applications', authenticateToken, getReqVolunteer, async (req, res) => {
  try {
    const allApps = await db.getApplications();
    const apps = allApps.filter(a => a.volunteerId.toString() === req.volunteer.id.toString());
    const opportunities = await db.getOpportunities();

    // Map opportunity details into application
    const detailedApps = apps.map(app => {
      const opp = opportunities.find(o => o.id.toString() === app.opportunityId.toString());
      return {
        ...app.toJSON(),
        opportunity: opp || null
      };
    });

    res.json(detailedApps);
  } catch (error) {
    console.error('Retrieve apps error:', error);
    res.status(500).json({ message: 'Failed to retrieve applications' });
  }
});

// Volunteer: Apply for a drive
app.post('/api/volunteer/applications', authenticateToken, getReqVolunteer, async (req, res) => {
  try {
    const { opportunityId } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ message: 'Opportunity ID is required' });
    }

    // Verify opportunity exists and is active
    const opp = await db.getOpportunityById(opportunityId);
    if (!opp) {
      return res.status(404).json({ message: 'Volunteer drive not found' });
    }

    if (opp.status !== 'Active') {
      return res.status(400).json({ message: 'This volunteer drive is no longer active' });
    }

    // Check volunteer approval status
    if (req.volunteer.status !== 'Approved') {
      return res.status(403).json({ message: 'Your volunteer registration is pending approval or has been rejected. You can apply for drives once an admin approves your profile.' });
    }

    const application = await db.createApplication({
      volunteerId: req.volunteer.id,
      opportunityId
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Failed to apply' });
  }
});


// --- ADMIN ROUTES ---

// Admin: Get Dashboard Stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const volunteers = await db.getVolunteers();
    const opportunities = await db.getOpportunities();
    const applications = await db.getApplications();

    const totalVolunteers = volunteers.length;
    const pendingVolunteers = volunteers.filter(v => v.status === 'Pending').length;
    const activeOpps = opportunities.filter(o => o.status === 'Active').length;
    
    // Sum hours of completed applications
    const totalHours = applications
      .filter(a => a.status === 'Completed')
      .reduce((sum, a) => sum + (Number(a.hoursLogged) || 0), 0);

    // Dynamic charts data preparation:
    const allUsers = await db.getUsers();
    const users = allUsers.filter(u => u.role === 'volunteer');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRegs = Array(12).fill(0);
    
    users.forEach(u => {
      if (u.createdAt) {
        const date = new Date(u.createdAt);
        monthlyRegs[date.getMonth()] += 1;
      }
    });

    // 2. Opportunities by category
    const categoryCounts = {};
    opportunities.forEach(o => {
      categoryCounts[o.category] = (categoryCounts[o.category] || 0) + 1;
    });
    const chartCategories = Object.keys(categoryCounts).map(cat => ({
      name: cat,
      value: categoryCounts[cat]
    }));

    // 3. Application status breakdown
    const statusCounts = { Pending: 0, Approved: 0, Completed: 0, Rejected: 0 };
    applications.forEach(a => {
      if (statusCounts[a.status] !== undefined) {
        statusCounts[a.status]++;
      }
    });

    res.json({
      summary: {
        totalVolunteers,
        pendingVolunteers,
        activeDrives: activeOpps,
        totalHours
      },
      charts: {
        registrations: months.map((name, idx) => ({ name, count: monthlyRegs[idx] })),
        categories: chartCategories,
        applications: Object.keys(statusCounts).map(status => ({ name: status, count: statusCounts[status] }))
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve stats' });
  }
});

// Admin: List all volunteers
app.get('/api/admin/volunteers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const volunteers = await db.getVolunteers();
    const users = await db.getUsers();

    const detailedVols = volunteers.map(vol => {
      const user = users.find(u => u.id.toString() === vol.userId.toString());
      return {
        ...vol.toJSON(),
        email: user ? user.email : 'N/A'
      };
    });

    res.json(detailedVols);
  } catch (error) {
    res.status(500).json({ message: 'Failed to list volunteers' });
  }
});

// Admin: Update volunteer status (Approve/Reject)
app.put('/api/admin/volunteers/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updated = await db.updateVolunteer(req.params.id, { status });
    if (!updated) {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update volunteer status' });
  }
});

// Admin: Edit volunteer profile
app.put('/api/admin/volunteers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, phone, skills, availability, interests, bio, hoursVolunteered } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (skills !== undefined) updates.skills = skills;
    if (availability !== undefined) updates.availability = availability;
    if (interests !== undefined) updates.interests = interests;
    if (bio !== undefined) updates.bio = bio;
    if (hoursVolunteered !== undefined) updates.hoursVolunteered = Number(hoursVolunteered);

    const updated = await db.updateVolunteer(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ message: 'Volunteer profile not found' });
    }
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update volunteer details' });
  }
});

// Admin: List all applications
app.get('/api/admin/applications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const apps = await db.getApplications();
    const volunteers = await db.getVolunteers();
    const users = await db.getUsers();
    const opportunities = await db.getOpportunities();

    const detailedApps = apps.map(app => {
      const vol = volunteers.find(v => v.id.toString() === app.volunteerId.toString());
      const user = vol ? users.find(u => u.id.toString() === vol.userId.toString()) : null;
      const opp = opportunities.find(o => o.id.toString() === app.opportunityId.toString());

      return {
        ...app.toJSON(),
        volunteer: vol ? { ...vol.toJSON(), email: user ? user.email : 'N/A' } : null,
        opportunity: opp || null
      };
    });

    res.json(detailedApps);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve applications' });
  }
});

// Admin: Update application status (Approve / Complete / Reject) and log hours
app.put('/api/admin/applications/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, hoursLogged } = req.body;
    
    const updates = {};
    if (status !== undefined) {
      if (!['Pending', 'Approved', 'Completed', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid application status' });
      }
      updates.status = status;
    }
    if (hoursLogged !== undefined) {
      updates.hoursLogged = Number(hoursLogged);
    }

    const updated = await db.updateApplication(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update application' });
  }
});

// Admin: Create drive
app.post('/api/admin/opportunities', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, location, duration, requiredVolunteers, category } = req.body;

    if (!title || !date || !location || !category) {
      return res.status(400).json({ message: 'Title, Date, Location, and Category are required' });
    }

    const opp = await db.createOpportunity({
      title,
      description: description || '',
      date,
      location,
      duration: duration || '2 hours',
      requiredVolunteers: Number(requiredVolunteers) || 5,
      category
    });

    res.status(201).json(opp);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create opportunity' });
  }
});

// Admin: Update drive
app.put('/api/admin/opportunities/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, location, duration, requiredVolunteers, category, status } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;
    if (location !== undefined) updates.location = location;
    if (duration !== undefined) updates.duration = duration;
    if (requiredVolunteers !== undefined) updates.requiredVolunteers = Number(requiredVolunteers);
    if (category !== undefined) updates.category = category;
    if (status !== undefined) {
      if (!['Active', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      updates.status = status;
    }

    const updated = await db.updateOpportunity(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update opportunity' });
  }
});

// Admin: Delete drive
app.delete('/api/admin/opportunities/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await db.deleteOpportunity(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.json({ message: 'Opportunity deleted successfully', deleted });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete opportunity' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`VoloSphere Express server running on http://localhost:${PORT}`);
});
