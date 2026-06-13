import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('CRITICAL ERROR: MONGODB_URI is not defined in backend/.env file.');
  process.exit(1);
}

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB Atlas.');
    await seedDatabase();
  })
  .catch(err => {
    console.error('MongoDB Atlas connection error:', err);
  });

// Schema serialization options to support 'id' virtual mapping instead of breaking frontend '_id' expects
const schemaOptions = {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
};

// Define Mongoose Schemas
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'volunteer'] },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, schemaOptions));

const Volunteer = mongoose.model('Volunteer', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  skills: { type: [String], default: [] },
  availability: { type: String, default: 'Weekends' },
  interests: { type: [String], default: [] },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  bio: { type: String, default: '' },
  hoursVolunteered: { type: Number, default: 0 }
}, schemaOptions));

const Opportunity = mongoose.model('Opportunity', new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: String, required: true },
  location: { type: String, required: true },
  duration: { type: String, default: '2 hours' },
  requiredVolunteers: { type: Number, default: 5 },
  category: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Completed', 'Cancelled'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
}, schemaOptions));

const Application = mongoose.model('Application', new mongoose.Schema({
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Completed', 'Rejected'], default: 'Pending' },
  hoursLogged: { type: Number, default: 0 },
  appliedAt: { type: Date, default: Date.now }
}, schemaOptions));

// Automatic Data Seeder
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial MongoDB data...');

      const adminSalt = bcrypt.genSaltSync(10);
      const adminHash = bcrypt.hashSync('admin123', adminSalt);
      
      const volunteerSalt = bcrypt.genSaltSync(10);
      const volunteerHash = bcrypt.hashSync('volunteer123', volunteerSalt);

      // 1. Create Default Users
      const adminUser = await User.create({
        email: 'admin@nayepankh.org',
        passwordHash: adminHash,
        role: 'admin',
        name: 'admin',
        createdAt: '2026-05-10T10:00:00.000Z'
      });

      const volunteerUser = await User.create({
        email: 'rahul.verma@gmail.com',
        passwordHash: volunteerHash,
        role: 'volunteer',
        name: 'Rahul Verma',
        createdAt: '2026-06-01T14:30:00.000Z'
      });

      // 2. Create Volunteer Profile
      const volunteerProfile = await Volunteer.create({
        userId: volunteerUser._id,
        name: 'Rahul Verma',
        phone: '+91 98765 43210',
        skills: ['Teaching', 'Public Speaking', 'Social Media'],
        availability: 'Weekends',
        interests: ['Education', 'Child Welfare'],
        status: 'Approved',
        bio: 'Passionate about teaching children and helping the community grow.',
        hoursVolunteered: 12
      });

      // 3. Create Default Opportunities
      const opp1 = await Opportunity.create({
        title: 'Education for All Campaign',
        description: 'Teach basic mathematics, English, and science to children from underprivileged backgrounds in rural communities. All materials will be provided.',
        date: '2026-06-20',
        location: 'Noida Sector 62 Learning Center',
        duration: '4 hours',
        requiredVolunteers: 15,
        category: 'Education',
        status: 'Active',
        createdAt: '2026-06-05T09:00:00.000Z'
      });

      const opp2 = await Opportunity.create({
        title: 'Weekly Food Distribution Drive',
        description: 'Join us in packaging and distributing nutritious warm meals to shelter homes and slum areas across Delhi NCR.',
        date: '2026-06-25',
        location: 'Connaught Place Community Hub',
        duration: '3 hours',
        requiredVolunteers: 25,
        category: 'Food Relief',
        status: 'Active',
        createdAt: '2026-06-06T10:30:00.000Z'
      });

      const opp3 = await Opportunity.create({
        title: 'Environment & Tree Plantation Drive',
        description: 'Planting saplings and cleaning up local parks. Help us restore urban green cover and raise environmental awareness.',
        date: '2026-07-02',
        location: 'Yamuna Biodiversity Park',
        duration: '5 hours',
        requiredVolunteers: 30,
        category: 'Environment',
        status: 'Active',
        createdAt: '2026-06-07T11:15:00.000Z'
      });

      const opp4 = await Opportunity.create({
        title: 'Free Health Screening Camp',
        description: 'Assisting medical practitioners in organizing queue management, patient registration, and distributing free basic medicines.',
        date: '2026-06-18',
        location: 'Ghaziabad Slum Clinic',
        duration: '6 hours',
        requiredVolunteers: 10,
        category: 'Healthcare',
        status: 'Active',
        createdAt: '2026-06-08T12:00:00.000Z'
      });

      // 4. Create Default Applications
      await Application.create({
        volunteerId: volunteerProfile._id,
        opportunityId: opp1._id,
        status: 'Completed',
        hoursLogged: 8,
        appliedAt: '2026-06-02T15:00:00.000Z'
      });

      await Application.create({
        volunteerId: volunteerProfile._id,
        opportunityId: opp2._id,
        status: 'Approved',
        hoursLogged: 4,
        appliedAt: '2026-06-04T10:00:00.000Z'
      });

      console.log('MongoDB initialization: Seed data successfully loaded.');
    }
  } catch (error) {
    console.error('MongoDB initialization error during seeding:', error);
  }
};

// Database operation wrapper class
class MongoDatabase {
  // User operations
  async getUsers() {
    return await User.find({});
  }

  async getUserByEmail(email) {
    if (!email) return null;
    return await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
  }

  async createUser(user) {
    const newUser = new User(user);
    return await newUser.save();
  }

  // Volunteer operations
  async getVolunteers() {
    return await Volunteer.find({});
  }

  async getVolunteerById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return await Volunteer.findById(id);
  }

  async getVolunteerByUserId(userId) {
    if (!mongoose.isValidObjectId(userId)) return null;
    return await Volunteer.findOne({ userId });
  }

  async createVolunteer(volunteer) {
    const newVol = new Volunteer(volunteer);
    return await newVol.save();
  }

  async updateVolunteer(id, updates) {
    if (!mongoose.isValidObjectId(id)) return null;
    return await Volunteer.findByIdAndUpdate(id, { $set: updates }, { new: true });
  }

  // Opportunity operations
  async getOpportunities() {
    return await Opportunity.find({});
  }

  async getOpportunityById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return await Opportunity.findById(id);
  }

  async createOpportunity(opp) {
    const newOpp = new Opportunity(opp);
    return await newOpp.save();
  }

  async updateOpportunity(id, updates) {
    if (!mongoose.isValidObjectId(id)) return null;
    return await Opportunity.findByIdAndUpdate(id, { $set: updates }, { new: true });
  }

  async deleteOpportunity(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    // Delete applications referencing this drive
    await Application.deleteMany({ opportunityId: id });
    return await Opportunity.findByIdAndDelete(id);
  }

  // Application operations
  async getApplications() {
    return await Application.find({});
  }

  async createApplication(app) {
    // Check if duplicate exists
    const duplicate = await Application.findOne({
      volunteerId: app.volunteerId,
      opportunityId: app.opportunityId
    });
    if (duplicate) return duplicate;

    const newApp = new Application(app);
    return await newApp.save();
  }

  async updateApplication(id, updates) {
    if (!mongoose.isValidObjectId(id)) return null;
    const oldApp = await Application.findById(id);
    if (!oldApp) return null;

    const updatedApp = await Application.findByIdAndUpdate(id, { $set: updates }, { new: true });

    // Handle lifetime hour changes when completion status shifts
    if (updates.status === 'Completed' && oldApp.status !== 'Completed') {
      const vol = await Volunteer.findById(updatedApp.volunteerId);
      if (vol) {
        const hours = Number(updatedApp.hoursLogged) || 0;
        await Volunteer.findByIdAndUpdate(vol.id, {
          $inc: { hoursVolunteered: hours }
        });
      }
    } else if (updates.status !== 'Completed' && oldApp.status === 'Completed') {
      // If status was changed back from Completed
      const vol = await Volunteer.findById(oldApp.volunteerId);
      if (vol) {
        const hours = Number(oldApp.hoursLogged) || 0;
        const newHours = Math.max(0, (vol.hoursVolunteered || 0) - hours);
        await Volunteer.findByIdAndUpdate(vol.id, {
          hoursVolunteered: newHours
        });
      }
    } else if (updates.hoursLogged !== undefined && oldApp.status === 'Completed') {
      // If hours logged changed while already completed
      const vol = await Volunteer.findById(updatedApp.volunteerId);
      if (vol) {
        const diff = (Number(updates.hoursLogged) || 0) - (Number(oldApp.hoursLogged) || 0);
        const newHours = Math.max(0, (vol.hoursVolunteered || 0) + diff);
        await Volunteer.findByIdAndUpdate(vol.id, {
          hoursVolunteered: newHours
        });
      }
    }

    return updatedApp;
  }
}

export const db = new MongoDatabase();
