const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const DonorProfile = require('./models/DonorProfile');
const BloodRequest = require('./models/BloodRequest');
const DonationHistory = require('./models/DonationHistory');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lifelink');
    console.log('[Seeder] Connected to MongoDB...');

    // Clear existing collections
    await User.deleteMany();
    await DonorProfile.deleteMany();
    await BloodRequest.deleteMany();
    await DonationHistory.deleteMany();
    console.log('[Seeder] Cleared previous records.');

    // 1. Create Admin Account
    const admin = await User.create({
      fullName: 'Chief Medical Administrator',
      email: 'admin@lifelink.org',
      password: 'Password123!',
      phone: '+1 (555) 019-2831',
      role: 'admin',
      isVerified: true
    });

    // 2. Create Requesters
    const requester1 = await User.create({
      fullName: 'Elena Rostova',
      email: 'elena.requester@lifelink.org',
      password: 'Password123!',
      phone: '+1 (555) 345-6789',
      role: 'requester',
      isVerified: true
    });

    // Reference base center: coordinates around Downtown Medical District (e.g. lat: 37.7749, lng: -122.4194 or standard city)
    // Let's use standard metropolitan coords: Lat ~40.7128, Lng ~-74.0060 (New York / Global Metro)
    const baseLat = 40.7128;
    const baseLng = -74.0060;

    // 3. Create Verified Donors with varied blood groups & proximity
    const donorSeeds = [
      {
        fullName: 'Sarah Jenkins',
        email: 'sarah.oneg@donor.lifelink.org',
        phone: '+1 (555) 111-2233',
        bloodGroup: 'O-', // Universal RBC Donor
        isAvailable: true,
        addressLocality: 'Westside Medical Corridor',
        latOffset: 0.015, // ~1.6 km
        lngOffset: 0.012,
        totalDonations: 8
      },
      {
        fullName: 'Marcus Vance',
        email: 'marcus.apos@donor.lifelink.org',
        phone: '+1 (555) 222-3344',
        bloodGroup: 'A+',
        isAvailable: true,
        addressLocality: 'Downtown Health Plaza',
        latOffset: -0.02, // ~2.2 km
        lngOffset: 0.018,
        totalDonations: 4
      },
      {
        fullName: 'Priya Sharma',
        email: 'priya.bpos@donor.lifelink.org',
        phone: '+1 (555) 333-4455',
        bloodGroup: 'B+',
        isAvailable: true,
        addressLocality: 'North Riverfront',
        latOffset: 0.035, // ~3.8 km
        lngOffset: -0.025,
        totalDonations: 12
      },
      {
        fullName: 'Carlos Mendoza',
        email: 'carlos.abpos@donor.lifelink.org',
        phone: '+1 (555) 444-5566',
        bloodGroup: 'AB+', // Universal Recipient
        isAvailable: true,
        addressLocality: 'Eastside District',
        latOffset: -0.04, // ~4.5 km
        lngOffset: -0.03,
        totalDonations: 3
      },
      {
        fullName: 'Aisha Bello',
        email: 'aisha.opos@donor.lifelink.org',
        phone: '+1 (555) 555-6677',
        bloodGroup: 'O+',
        isAvailable: true,
        addressLocality: 'Uptown Heights',
        latOffset: 0.05, // ~5.5 km
        lngOffset: 0.04,
        totalDonations: 6
      },
      {
        fullName: 'Alexander Wright',
        email: 'alex.bneg@donor.lifelink.org',
        phone: '+1 (555) 666-7788',
        bloodGroup: 'B-',
        isAvailable: false, // Currently resting
        addressLocality: 'South Suburban Square',
        latOffset: 0.08,
        lngOffset: -0.06,
        totalDonations: 5
      }
    ];

    const createdDonorProfiles = [];

    for (const d of donorSeeds) {
      const u = await User.create({
        fullName: d.fullName,
        email: d.email,
        password: 'Password123!',
        phone: d.phone,
        role: 'donor',
        isVerified: true
      });

      const profile = await DonorProfile.create({
        user: u._id,
        bloodGroup: d.bloodGroup,
        isAvailable: d.isAvailable,
        addressLocality: d.addressLocality,
        totalDonations: d.totalDonations,
        lastDonationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        location: {
          type: 'Point',
          coordinates: [baseLng + d.lngOffset, baseLat + d.latOffset]
        }
      });

      createdDonorProfiles.push({ user: u, profile });
    }

    // 4. Create Sample Active Blood Requests
    const req1 = await BloodRequest.create({
      requester: requester1._id,
      patientName: 'David K. (ICU Trauma)',
      bloodGroup: 'A+',
      unitsNeeded: 2,
      hospitalName: 'Metropolitan General Hospital',
      hospitalAddress: '450 Healthcare Ave, Suite 3',
      location: {
        type: 'Point',
        coordinates: [baseLng, baseLat]
      },
      urgency: 'CRITICAL',
      status: 'PENDING',
      contactPhone: '+1 (555) 911-0021',
      notes: 'Emergency scheduled surgery, urgently needs compatible whole blood or packed RBC.'
    });

    const req2 = await BloodRequest.create({
      requester: requester1._id,
      patientName: 'Emma Watson',
      bloodGroup: 'O-',
      unitsNeeded: 1,
      hospitalName: 'St. Jude Cardiac Center',
      hospitalAddress: '120 Hope Street',
      location: {
        type: 'Point',
        coordinates: [baseLng + 0.01, baseLat + 0.01]
      },
      urgency: 'URGENT',
      status: 'PENDING',
      contactPhone: '+1 (555) 888-2121',
      notes: 'Pediatric unit blood requirement.'
    });

    // 5. Create a Fulfilled Request & Donation History record
    const reqFulfilled = await BloodRequest.create({
      requester: requester1._id,
      patientName: 'Robert Vance',
      bloodGroup: 'O-',
      unitsNeeded: 1,
      hospitalName: 'City Memorial Trauma Wing',
      hospitalAddress: '88 Center Blvd',
      location: {
        type: 'Point',
        coordinates: [baseLng, baseLat]
      },
      urgency: 'CRITICAL',
      status: 'FULFILLED',
      contactPhone: '+1 (555) 777-9911',
      acceptedByDonor: createdDonorProfiles[0].profile._id,
      acceptedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      fulfilledAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      notes: 'Successfully completed transfusion.'
    });

    await DonationHistory.create({
      donor: createdDonorProfiles[0].profile._id,
      donorUser: createdDonorProfiles[0].user._id,
      request: reqFulfilled._id,
      patientName: reqFulfilled.patientName,
      bloodGroup: reqFulfilled.bloodGroup,
      unitsDonated: 1,
      hospitalName: reqFulfilled.hospitalName,
      completedAt: reqFulfilled.fulfilledAt,
      notes: 'Lifesaving emergency whole blood donation.'
    });

    console.log('[Seeder] Database successfully seeded with verified donors, admin, requests, and history!');
    console.log('[Seeder] Demo Admin Login: admin@lifelink.org / Password123!');
    console.log('[Seeder] Demo Donor Login: sarah.oneg@donor.lifelink.org / Password123!');
    console.log('[Seeder] Demo Requester Login: elena.requester@lifelink.org / Password123!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();
