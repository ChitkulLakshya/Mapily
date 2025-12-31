const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Place = require('../importer/placeModel');

async function clearSeedData() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in .env');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Removing seed data (source: "manual")...');
    const result = await Place.deleteMany({ source: 'manual' });
    
    console.log(`Successfully removed ${result.deletedCount} seed places.`);

  } catch (error) {
    console.error('Error clearing seed data:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

clearSeedData();
