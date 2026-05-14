import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hospital from '../models/Hospital.js';
import Ambulance from '../models/Ambulance.js';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedData = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Hospital.deleteMany({});
    await Ambulance.deleteMany({});

    // Seed Hospitals — Maharashtra (Jalgaon, Pune, Mumbai, Nagpur)
    const hospitals = await Hospital.insertMany([
      {
        name: 'Dr. Ulhas Patil Medical College',
        address: 'Jalgaon-Bhusawal Road, Jalgaon 425309',
        city: 'Jalgaon', state: 'Maharashtra',
        phone: '+91-257-2260515',
        location: { lat: 21.0250, lng: 75.5700 },
        specialties: ['Multi-specialty', 'Emergency', 'Cardiac', 'Neurology', 'Orthopedics'],
        beds: { general: { total: 200, available: 42 }, icu: { total: 30, available: 8 }, oxygen: { total: 50, available: 15 }, ventilator: { total: 20, available: 5 } },
        traumaSupport: true, emergencySupport: true,
        ambulanceCount: 8, waitTime: 5, rating: 4.6, totalReviews: 1245,
        doctors: [
          { name: 'Dr. Priya Sharma', specialty: 'Cardiologist', available: true },
          { name: 'Dr. Rajesh Kumar', specialty: 'Trauma Surgeon', available: true }
        ]
      },
      {
        name: 'Tapadia Hospital',
        address: 'Navi Peth, Jalgaon 425001',
        city: 'Jalgaon', state: 'Maharashtra',
        phone: '+91-257-2228888',
        location: { lat: 21.0100, lng: 75.5630 },
        specialties: ['Cardiac', 'Orthopedics', 'Emergency', 'Pediatrics'],
        beds: { general: { total: 150, available: 18 }, icu: { total: 20, available: 3 }, oxygen: { total: 35, available: 10 }, ventilator: { total: 15, available: 2 } },
        traumaSupport: false, emergencySupport: true,
        ambulanceCount: 5, waitTime: 12, rating: 4.4, totalReviews: 890,
        doctors: [
          { name: 'Dr. Vikram Patel', specialty: 'Cardiologist', available: true }
        ]
      },
      {
        name: 'Sahyadri Hospital',
        address: 'Karve Road, Deccan Gymkhana, Pune 411004',
        city: 'Pune', state: 'Maharashtra',
        phone: '+91-20-67210000',
        location: { lat: 18.5089, lng: 73.8378 },
        specialties: ['Multi-specialty', 'Cardiac', 'Neurosurgery', 'Trauma'],
        beds: { general: { total: 300, available: 65 }, icu: { total: 40, available: 12 }, oxygen: { total: 60, available: 22 }, ventilator: { total: 25, available: 8 } },
        traumaSupport: true, emergencySupport: true,
        ambulanceCount: 10, waitTime: 8, rating: 4.7, totalReviews: 2100,
        doctors: [
          { name: 'Dr. Amit Verma', specialty: 'Neurosurgeon', available: true },
          { name: 'Dr. Kavita Singh', specialty: 'Emergency Medicine', available: true }
        ]
      },
      {
        name: 'Lilavati Hospital',
        address: 'A-791, Bandra Reclamation, Mumbai 400050',
        city: 'Mumbai', state: 'Maharashtra',
        phone: '+91-22-26751000',
        location: { lat: 19.0510, lng: 72.8265 },
        specialties: ['Multi-specialty', 'Cardiac', 'Oncology', 'Neurology', 'Transplant'],
        beds: { general: { total: 250, available: 30 }, icu: { total: 50, available: 6 }, oxygen: { total: 70, available: 18 }, ventilator: { total: 30, available: 4 } },
        traumaSupport: true, emergencySupport: true,
        ambulanceCount: 12, waitTime: 3, rating: 4.8, totalReviews: 3200,
        doctors: [
          { name: 'Dr. Suresh Nair', specialty: 'Cardiologist', available: true },
          { name: 'Dr. Fatima Ali', specialty: 'Oncologist', available: true }
        ]
      },
      {
        name: 'AIIMS Nagpur',
        address: 'Plot No. 2, Sector 20, Nagpur 441108',
        city: 'Nagpur', state: 'Maharashtra',
        phone: '+91-712-2234567',
        location: { lat: 21.0613, lng: 79.0465 },
        specialties: ['Multi-specialty', 'Emergency', 'Trauma', 'Cardiac', 'Neurology'],
        beds: { general: { total: 350, available: 55 }, icu: { total: 45, available: 10 }, oxygen: { total: 80, available: 20 }, ventilator: { total: 30, available: 7 } },
        traumaSupport: true, emergencySupport: true,
        ambulanceCount: 15, waitTime: 6, rating: 4.9, totalReviews: 4500,
        doctors: [
          { name: 'Dr. Pooja Gupta', specialty: 'Pediatrician', available: true },
          { name: 'Dr. Manish Jain', specialty: 'Trauma Surgeon', available: true }
        ]
      }
    ]);

    console.log(`✅ Seeded ${hospitals.length} hospitals`);

    // Seed Ambulances
    const ambulances = await Ambulance.insertMany([
      { vehicleNumber: 'MH-21-AM-4021', driver: { name: 'Ramesh Kumar', phone: '+91-9876543210', license: 'MH-12345' }, type: 'advanced', hospitalId: hospitals[0]._id, currentLocation: { lat: 21.0100, lng: 75.5600 }, status: 'available' },
      { vehicleNumber: 'MH-21-AM-4022', driver: { name: 'Sunil Yadav', phone: '+91-9876543211', license: 'MH-12346' }, type: 'icu_mobile', hospitalId: hospitals[0]._id, currentLocation: { lat: 21.0200, lng: 75.5700 }, status: 'available' },
      { vehicleNumber: 'MH-12-AM-5501', driver: { name: 'Ahmed Khan', phone: '+91-9876543212', license: 'MH-12347' }, type: 'basic', hospitalId: hospitals[2]._id, currentLocation: { lat: 18.5100, lng: 73.8400 }, status: 'available' },
      { vehicleNumber: 'MH-01-AM-6601', driver: { name: 'Vijay Singh', phone: '+91-9876543213', license: 'MH-12348' }, type: 'advanced', hospitalId: hospitals[3]._id, currentLocation: { lat: 19.0500, lng: 72.8300 }, status: 'dispatched' },
      { vehicleNumber: 'MH-31-AM-7701', driver: { name: 'Deepak Sharma', phone: '+91-9876543214', license: 'MH-12349' }, type: 'icu_mobile', hospitalId: hospitals[4]._id, currentLocation: { lat: 21.0600, lng: 79.0500 }, status: 'available' },
    ]);

    console.log(`✅ Seeded ${ambulances.length} ambulances`);

    // Create demo users
    const existingAdmin = await User.findOne({ email: 'admin@resqai.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'ResQAI Admin',
        email: 'admin@resqai.com',
        password: 'admin123',
        role: 'super_admin',
        phone: '+91-9999999999',
        bloodGroup: 'O+',
        isVerified: true
      });
      console.log('✅ Admin user created (admin@resqai.com / admin123)');
    }

    const existingUser = await User.findOne({ email: 'user@resqai.com' });
    if (!existingUser) {
      await User.create({
        name: 'Dnyaneshwar Patil',
        email: 'user@resqai.com',
        password: 'user123',
        role: 'user',
        phone: '+91-8888888888',
        bloodGroup: 'O+',
        isVerified: true,
        allergies: ['Peanuts', 'Penicillin'],
        medicalConditions: ['Asthma'],
        medications: ['Albuterol Inhaler', 'Loratadine 10mg'],
        emergencyContacts: [
          { name: 'Rahul Patil', phone: '+91-7777777777', relation: 'Brother' },
          { name: 'Priya Patil', phone: '+91-6666666666', relation: 'Mother' }
        ],
        insurance: 'Star Health — Policy #SH-847291',
        language: 'English',
        organDonor: false,
        chronicConditions: 'Asthma',
        familyTracking: [
          { name: 'Rahul Patil', phone: '+91-7777777777', enabled: true },
          { name: 'Priya Patil', phone: '+91-6666666666', enabled: true }
        ]
      });
      console.log('✅ Demo user created (user@resqai.com / user123)');
    }

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
