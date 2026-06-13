import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Default initial state
const getInitialState = () => {
  const adminSalt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('admin123', adminSalt);
  
  const volunteerSalt = bcrypt.genSaltSync(10);
  const volunteerHash = bcrypt.hashSync('volunteer123', volunteerSalt);

  return {
    users: [
      {
        id: 'u-1',
        email: 'admin@nayepankh.org',
        passwordHash: adminHash,
        role: 'admin',
        name: 'Aditi Sharma',
        createdAt: '2026-05-10T10:00:00.000Z'
      },
      {
        id: 'u-2',
        email: 'rahul.verma@gmail.com',
        passwordHash: volunteerHash,
        role: 'volunteer',
        name: 'Rahul Verma',
        createdAt: '2026-06-01T14:30:00.000Z'
      }
    ],
    volunteers: [
      {
        id: 'v-2',
        userId: 'u-2',
        name: 'Rahul Verma',
        phone: '+91 98765 43210',
        skills: ['Teaching', 'Public Speaking', 'Social Media'],
        availability: 'Weekends',
        interests: ['Education', 'Child Welfare'],
        status: 'Approved',
        bio: 'Passionate about teaching children and helping the community grow.',
        hoursVolunteered: 12
      }
    ],
    opportunities: [
      {
        id: 'o-1',
        title: 'Education for All Campaign',
        description: 'Teach basic mathematics, English, and science to children from underprivileged backgrounds in rural communities. All materials will be provided.',
        date: '2026-06-20',
        location: 'Noida Sector 62 Learning Center',
        duration: '4 hours',
        requiredVolunteers: 15,
        category: 'Education',
        status: 'Active',
        createdAt: '2026-06-05T09:00:00.000Z'
      },
      {
        id: 'o-2',
        title: 'Weekly Food Distribution Drive',
        description: 'Join us in packaging and distributing nutritious warm meals to shelter homes and slum areas across Delhi NCR.',
        date: '2026-06-25',
        location: 'Connaught Place Community Hub',
        duration: '3 hours',
        requiredVolunteers: 25,
        category: 'Food Relief',
        status: 'Active',
        createdAt: '2026-06-06T10:30:00.000Z'
      },
      {
        id: 'o-3',
        title: 'Environment & Tree Plantation Drive',
        description: 'Planting saplings and cleaning up local parks. Help us restore urban green cover and raise environmental awareness.',
        date: '2026-07-02',
        location: 'Yamuna Biodiversity Park',
        duration: '5 hours',
        requiredVolunteers: 30,
        category: 'Environment',
        status: 'Active',
        createdAt: '2026-06-07T11:15:00.000Z'
      },
      {
        id: 'o-4',
        title: 'Free Health Screening Camp',
        description: 'Assisting medical practitioners in organizing queue management, patient registration, and distributing free basic medicines.',
        date: '2026-06-18',
        location: 'Ghaziabad Slum Clinic',
        duration: '6 hours',
        requiredVolunteers: 10,
        category: 'Healthcare',
        status: 'Active',
        createdAt: '2026-06-08T12:00:00.000Z'
      }
    ],
    applications: [
      {
        id: 'a-1',
        volunteerId: 'v-2',
        opportunityId: 'o-1',
        status: 'Completed',
        hoursLogged: 8,
        appliedAt: '2026-06-02T15:00:00.000Z'
      },
      {
        id: 'a-2',
        volunteerId: 'v-2',
        opportunityId: 'o-2',
        status: 'Approved',
        hoursLogged: 4,
        appliedAt: '2026-06-04T10:00:00.000Z'
      }
    ]
  };
};

// Database class
class JSONDatabase {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = getInitialState();
        this.save();
      }
    } catch (error) {
      console.error('Failed to initialize database, using memory-fallback:', error);
      this.data = getInitialState();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  }

  // User operations
  getUsers() {
    return this.data.users;
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user) {
    const newUser = {
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...user
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // Volunteer operations
  getVolunteers() {
    return this.data.volunteers;
  }

  getVolunteerById(id) {
    return this.data.volunteers.find(v => v.id === id);
  }

  getVolunteerByUserId(userId) {
    return this.data.volunteers.find(v => v.userId === userId);
  }

  createVolunteer(volunteer) {
    const newVol = {
      id: `v-${Date.now()}`,
      hoursVolunteered: 0,
      status: 'Pending', // Pending, Approved, Rejected
      ...volunteer
    };
    this.data.volunteers.push(newVol);
    this.save();
    return newVol;
  }

  updateVolunteer(id, updates) {
    const volIndex = this.data.volunteers.findIndex(v => v.id === id);
    if (volIndex !== -1) {
      this.data.volunteers[volIndex] = {
        ...this.data.volunteers[volIndex],
        ...updates
      };
      this.save();
      return this.data.volunteers[volIndex];
    }
    return null;
  }

  // Opportunity operations
  getOpportunities() {
    return this.data.opportunities;
  }

  getOpportunityById(id) {
    return this.data.opportunities.find(o => o.id === id);
  }

  createOpportunity(opp) {
    const newOpp = {
      id: `o-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Active',
      ...opp
    };
    this.data.opportunities.push(newOpp);
    this.save();
    return newOpp;
  }

  updateOpportunity(id, updates) {
    const index = this.data.opportunities.findIndex(o => o.id === id);
    if (index !== -1) {
      this.data.opportunities[index] = {
        ...this.data.opportunities[index],
        ...updates
      };
      this.save();
      return this.data.opportunities[index];
    }
    return null;
  }

  deleteOpportunity(id) {
    const index = this.data.opportunities.findIndex(o => o.id === id);
    if (index !== -1) {
      // Also delete/archive applications for this opportunity
      this.data.applications = this.data.applications.filter(a => a.opportunityId !== id);
      const deleted = this.data.opportunities.splice(index, 1);
      this.save();
      return deleted[0];
    }
    return null;
  }

  // Application operations
  getApplications() {
    return this.data.applications;
  }

  createApplication(app) {
    // Check if duplicate exists
    const duplicate = this.data.applications.find(
      a => a.volunteerId === app.volunteerId && a.opportunityId === app.opportunityId
    );
    if (duplicate) return duplicate;

    const newApp = {
      id: `a-${Date.now()}`,
      status: 'Pending', // Pending, Approved, Completed, Rejected
      hoursLogged: 0,
      appliedAt: new Date().toISOString(),
      ...app
    };
    this.data.applications.push(newApp);
    this.save();
    return newApp;
  }

  updateApplication(id, updates) {
    const index = this.data.applications.findIndex(a => a.id === id);
    if (index !== -1) {
      const oldApp = this.data.applications[index];
      const updatedApp = {
        ...oldApp,
        ...updates
      };
      this.data.applications[index] = updatedApp;

      // If status changed to Completed and hours were logged, update volunteer's lifetime hours
      if (updates.status === 'Completed' && oldApp.status !== 'Completed') {
        const vol = this.getVolunteerById(updatedApp.volunteerId);
        if (vol) {
          const hours = Number(updatedApp.hoursLogged) || 0;
          this.updateVolunteer(vol.id, {
            hoursVolunteered: (vol.hoursVolunteered || 0) + hours
          });
        }
      } else if (updates.status !== 'Completed' && oldApp.status === 'Completed') {
        // If status was changed back from Completed
        const vol = this.getVolunteerById(oldApp.volunteerId);
        if (vol) {
          const hours = Number(oldApp.hoursLogged) || 0;
          this.updateVolunteer(vol.id, {
            hoursVolunteered: Math.max(0, (vol.hoursVolunteered || 0) - hours)
          });
        }
      } else if (updates.hoursLogged !== undefined && oldApp.status === 'Completed') {
        // If hours logged changed while it is already in Completed status
        const vol = this.getVolunteerById(updatedApp.volunteerId);
        if (vol) {
          const diff = (Number(updates.hoursLogged) || 0) - (Number(oldApp.hoursLogged) || 0);
          this.updateVolunteer(vol.id, {
            hoursVolunteered: Math.max(0, (vol.hoursVolunteered || 0) + diff)
          });
        }
      }

      this.save();
      return updatedApp;
    }
    return null;
  }
}

export const db = new JSONDatabase();
