const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Place = require('../importer/placeModel');
const magicpinScraper = require('../services/scrapers/magicpin');
const { METRO_CITIES } = require('../utils/metroCities');

// We can add other scrapers here if they implement discoverPlaces
const DISCOVERY_SCRAPERS = [magicpinScraper];

async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in .env');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function discoverPlacesForCity(city) {
  const localities = METRO_CITIES[city.toLowerCase()];
  if (!localities) {
    console.error(`No localities defined for ${city}`);
    return;
  }

  console.log(`Starting discovery for ${city} (${localities.length} localities)...`);

  for (const locality of localities) {
    console.log(`\nScanning ${locality}...`);
    
    for (const scraper of DISCOVERY_SCRAPERS) {
      try {
        const foundPlaces = await scraper.discoverPlaces(locality, city);
        console.log(`  [${scraper.platform}] Found ${foundPlaces.length} places.`);

        if (foundPlaces.length > 0) {
          let newCount = 0;
          for (const p of foundPlaces) {
            // Check for duplicates by name and locality
            // Using a regex for loose matching
            const existing = await Place.findOne({
              name: { $regex: new RegExp(`^${p.name}$`, 'i') },
              $or: [
                { locality: { $regex: new RegExp(locality, 'i') } },
                { address: { $regex: new RegExp(locality, 'i') } }
              ]
            });

            if (!existing) {
              await Place.create({
                name: p.name,
                category: 'Restaurant', // Default, can be refined
                address: p.address,
                locality: p.locality,
                city: p.city,
                photo_url: p.photo_url,
                google_maps_link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ' ' + p.address)}`,
                latitude: '0', // Placeholder
                longitude: '0', // Placeholder
                source: scraper.platform,
                isActive: true,
                fsq_id: `${scraper.platform}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
              });
              newCount++;
            }
          }
          console.log(`  Saved ${newCount} new places.`);
        }
        
        // Be polite
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (err) {
        console.error(`  [${scraper.platform}] Error: ${err.message}`);
      }
    }
  }
}

async function main() {
  await connectDB();

  // Default to Hyderabad if no arg provided
  const targetCity = process.argv[2] || 'hyderabad';
  
  await discoverPlacesForCity(targetCity);

  console.log('\nDiscovery completed.');
  await mongoose.disconnect();
  process.exit(0);
}

main();
