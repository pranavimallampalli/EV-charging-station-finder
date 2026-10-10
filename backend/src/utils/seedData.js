import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Station from '../models/Station.js';

const demoStations = [
  // 1. Existing Record 1 (Bengaluru)
  {
    name: 'ChargeNear Hub — Tech Corridor',
    address: {
      street: '101 Innovation Blvd',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560100',
      landmark: 'Near Tech Park Gate 2'
    },
    location: {
      type: 'Point',
      coordinates: [77.6833, 12.9249]
    },
    connectors: [
      { type: 'CCS2', powerKW: 50 },
      { type: 'Type 2', powerKW: 22 }
    ],
    availability: {
      status: 'Unknown',
      isLiveVerified: false,
      source: 'Catalog Record',
      lastUpdated: new Date()
    },
    operator: {
      name: 'Power Grid Network',
      network: 'EcoCharge Network'
    },
    pricing: {
      costPerKWh: 18.0,
      currency: 'INR',
      isFree: false
    },
    amenities: ['Restrooms', 'WiFi', '24/7 Access'],
    isDemoRecord: true,
    isPrimaryDemo: false
  },
  // 2. Existing Record 2 (Hyderabad)
  {
    name: 'ChargeNear Station — Eco Park',
    address: {
      street: '42 Green Way, Hitec City',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500081',
      landmark: 'Cyber Towers Circle'
    },
    location: {
      type: 'Point',
      coordinates: [78.3826, 17.4435]
    },
    connectors: [
      { type: 'CCS2', powerKW: 60 },
      { type: 'CHAdeMO', powerKW: 50 }
    ],
    availability: {
      status: 'Unknown',
      isLiveVerified: false,
      source: 'Catalog Record',
      lastUpdated: new Date()
    },
    operator: {
      name: 'Energy Corp',
      network: 'VoltGrid Network'
    },
    pricing: {
      costPerKWh: 19.5,
      currency: 'INR',
      isFree: false
    },
    amenities: ['Cafe', 'Covered Parking'],
    isDemoRecord: true,
    isPrimaryDemo: false
  },
  // 3. Existing Record 3 (Bengaluru)
  {
    name: 'ChargeNear Station — Metro Terminal',
    address: {
      street: '7 Urban Transit Plaza, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      landmark: 'Opposite Central Metro Station'
    },
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716]
    },
    connectors: [
      { type: 'Type 2', powerKW: 22 },
      { type: 'Standard AC', powerKW: 7.4 }
    ],
    availability: {
      status: 'Unknown',
      isLiveVerified: false,
      source: 'Catalog Record',
      lastUpdated: new Date()
    },
    operator: {
      name: 'City Mobility Systems',
      network: 'Metro EV Network'
    },
    pricing: {
      costPerKWh: 15.0,
      currency: 'INR',
      isFree: false
    },
    amenities: ['Restrooms', 'Shopping', '24/7 Access'],
    isDemoRecord: true,
    isPrimaryDemo: false
  },
  // 4. Existing Record 4 (Mumbai)
  {
    name: 'ChargeNear Station — Coastal Point',
    address: {
      street: '88 Harbor Bay Promenade, Colaba',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      landmark: 'Waterfront Complex'
    },
    location: {
      type: 'Point',
      coordinates: [72.8258, 18.922]
    },
    connectors: [
      { type: 'CCS2', powerKW: 120 },
      { type: 'GB/T', powerKW: 50 }
    ],
    availability: {
      status: 'Unknown',
      isLiveVerified: false,
      source: 'Catalog Record',
      lastUpdated: new Date()
    },
    operator: {
      name: 'Harbor Charging Network',
      network: 'BayCharge Network'
    },
    pricing: {
      costPerKWh: 22.0,
      currency: 'INR',
      isFree: false
    },
    amenities: ['Restrooms', 'Cafe'],
    isDemoRecord: true,
    isPrimaryDemo: false
  },
  // 5. Existing Record 5 (Delhi)
  {
    name: 'ChargeNear Station — Ring Road Rest Stop',
    address: {
      street: '15 Bypass Highway Mile 4',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110037',
      landmark: 'Near Aerocity Link Flyover'
    },
    location: {
      type: 'Point',
      coordinates: [77.1025, 28.5355]
    },
    connectors: [
      { type: 'CCS2', powerKW: 60 },
      { type: 'Type 2', powerKW: 22 }
    ],
    availability: {
      status: 'Unknown',
      isLiveVerified: false,
      source: 'Catalog Record',
      lastUpdated: new Date()
    },
    operator: {
      name: 'Expressway EV Network',
      network: 'Highway Volt Network'
    },
    pricing: {
      costPerKWh: 17.5,
      currency: 'INR',
      isFree: false
    },
    amenities: ['Restrooms', 'Cafe', 'Covered Parking', '24/7 Access'],
    isDemoRecord: true,
    isPrimaryDemo: false
  },
  // 6. Additional Hyderabad Record 1: PRIMARY FUNCTIONAL STATION (Cyber Towers)
  {
    name: 'ChargeNear Hub — Cyber Towers',
    address: {
      street: 'Cyber Towers Circle, HITEC City',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500081',
      landmark: 'Cyber Towers Main Plaza'
    },
    location: {
      type: 'Point',
      coordinates: [78.3808, 17.4504] // Validated public destination: Cyber Towers, HITEC City, Hyderabad
    },
    connectors: [
      { type: 'CCS2', powerKW: 60 },
      { type: 'Type 2', powerKW: 22 }
    ],
    availability: {
      status: 'Unknown',
      isLiveVerified: false,
      source: 'Catalog Record',
      lastUpdated: new Date()
    },
    operator: {
      name: 'Cyber Towers Mobility Network',
      network: 'ChargeNear Transit'
    },
    pricing: {
      costPerKWh: 18.5,
      currency: 'INR',
      isFree: false
    },
    amenities: ['Restrooms', 'Cafe', 'Covered Parking', '24/7 Access'],
    isDemoRecord: true,
    isPrimaryDemo: true,
    verifiedDestination: 'Cyber Towers, HITEC City, Hyderabad'
  },
  // 7. Additional Hyderabad Record 2: SECONDARY STATION (Financial District)
  {
    name: 'ChargeNear Point — Financial District',
    address: {
      street: 'ISB Road, Nanakramguda',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500032',
      landmark: 'Financial District Circle'
    },
    location: {
      type: 'Point',
      coordinates: [78.3428, 17.4239]
    },
    connectors: [
      { type: 'CCS2', powerKW: 50 },
      { type: 'CHAdeMO', powerKW: 50 }
    ],
    availability: {
      status: 'Unknown',
      isLiveVerified: false,
      source: 'Catalog Record',
      lastUpdated: new Date()
    },
    operator: {
      name: 'Financial District Green Energy',
      network: 'ChargeNear Transit'
    },
    pricing: {
      costPerKWh: 19.0,
      currency: 'INR',
      isFree: false
    },
    amenities: ['Restrooms', 'WiFi'],
    isDemoRecord: true,
    isPrimaryDemo: false
  }
];

export const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set. Please set it in backend/.env before seeding.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');

    // Remove existing demo records
    const deleteResult = await Station.deleteMany({ isDemoRecord: true });
    console.log(`Cleared ${deleteResult.deletedCount} existing demonstration station records.`);

    // Insert new demonstration stations
    const createdStations = await Station.insertMany(demoStations);
    console.log(`✅ Successfully seeded exactly ${createdStations.length} charging stations.`);

    console.log('\nSeeded Stations:');
    createdStations.forEach((s) => {
      console.log(` - [${s.availability.status}] ${s.name} (${s.address.city})${s.isPrimaryDemo ? ' [PRIMARY FUNCTIONAL]' : ''}`);
    });

    await mongoose.disconnect();
    console.log('Database connection closed.');
    return createdStations;
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

// Execute if run directly from CLI
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase();
}
