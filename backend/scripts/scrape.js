const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Place = require('../importer/placeModel');
const zomatoScraper = require('../services/scrapers/zomato');
const swiggyScraper = require('../services/scrapers/swiggy');
const magicpinScraper = require('../services/scrapers/magicpin');
const districtScraper = require('../services/scrapers/district');
const offerService = require('../services/offerService');
const { getCityLocalityRegex, METRO_CITIES } = require('../utils/metroCities');

// Map platform names to scraper instances
const SCRAPERS = {
  zomato: zomatoScraper,
  swiggy: swiggyScraper,
  magicpin: magicpinScraper,
  district: districtScraper
};

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

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    platform: 'all',
    limit: 0 // 0 = no limit
  };

  args.forEach(arg => {
    if (arg.startsWith('--platform=')) {
      options.platform = arg.split('=')[1].toLowerCase();
    }
    if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1], 10);
    }
  });

  return options;
}

function extractCity(address) {
  // Simple heuristic: take the last part of the address as city/state
  // Better approach: use a geocoding library or structured address if available
  if (!address) return 'Hyderabad'; // Default fallback
  const parts = address.split(',');
  if (parts.length >= 2) {
    // Try to find a city-like part (not a pincode)
    const cityPart = parts[parts.length - 2].trim(); // Often State or City
    // Remove pincodes
    const city = cityPart.replace(/\d{6}/, '').trim() || parts[parts.length - 3]?.trim() || 'Hyderabad';
    // If the extracted city is not Hyderabad, but we want to force it for this context
    // we can check if address contains Hyderabad.
    if (address.toLowerCase().includes('hyderabad')) {
      return 'Hyderabad';
    }
    return city;
  }
  return 'Hyderabad';
}

async function scrapePlace(place, platform) {
  const city = extractCity(place.address);
  console.log(`\nScraping ${place.name} (${city})...`);

  let offers = [];

  if (platform === 'all') {
    // Use OfferService to get best offers from all platforms (and cache them)
    // This warms up the cache
    offers = await offerService.getBestOffers(place.name, city, place.address);
    console.log(`Found ${offers.length} offers across all platforms.`);
  } else {
    // Run specific scraper
    const scraper = SCRAPERS[platform];
    if (!scraper) {
      console.error(`Unknown platform: ${platform}`);
      return;
    }
    try {
      offers = await scraper.getOffers(place.name, city, place.address);
      console.log(`[${platform}] Found ${offers.length} offers.`);
    } catch (err) {
      console.error(`[${platform}] Error: ${err.message}`);
    }
  }

  if (offers.length > 0) {
    console.log('Top Offer:', offers[0].offerTitle, `(${offers[0].discountValue})`);
    
    // Save offers to MongoDB
    try {
      place.offers = offers.map(o => ({
        ...o,
        updatedAt: new Date()
      }));
      await place.save();
      console.log('Offers saved to database.');
    } catch (saveErr) {
      console.error('Error saving offers to DB:', saveErr.message);
    }
  }
}

async function verifyDatabase() {
  try {
    const totalCount = await Place.countDocuments();
    console.log(`\n[DB Check] Total places in DB: ${totalCount}`);

    if (totalCount === 0) {
      console.error('\n[ERROR] No places found in database!');
      console.error('Please run the seed script first:');
      console.error('  npm run seed:places');
      return false;
    }

    const distinctCities = await Place.distinct('city');
    console.log(`[DB Check] Distinct cities: ${distinctCities.join(', ') || 'None'}`);
    
    return true;
  } catch (err) {
    console.error('[DB Check] Error verifying database:', err.message);
    return false;
  }
}

async function main() {
  const options = parseArgs();
  await connectDB();

  try {
    // 1. Verify DB state
    const dbReady = await verifyDatabase();
    if (!dbReady) {
      process.exit(1);
    }

    const targetCity = 'hyderabad'; // Can be made dynamic later
    console.log(`\nFetching places for ${targetCity} metro area...`);
    
    // Get regex for all localities in the metro city
    const cityRegex = getCityLocalityRegex(targetCity);

    // Updated Query Logic:
    // 1. isActive: true
    // 2. Match city OR locality OR address regex
    let query = Place.find({
      isActive: true,
      $or: [
        { city: { $regex: new RegExp(targetCity, 'i') } },
        { locality: { $regex: cityRegex } },
        { address: { $regex: cityRegex } }
      ]
    });
    
    if (options.limit > 0) {
      query = query.limit(options.limit);
    }

    const places = await query.exec();
    console.log(`Found ${places.length} active places to process in ${targetCity} metro area.`);

    if (places.length === 0) {
      console.warn('\n[WARNING] No matching places found for scraping.');
      console.warn('Try running the seed script to populate data:');
      console.warn('  npm run seed:places');
      process.exit(0);
    }

    // Log distribution by locality (simple check)
    const localityStats = {};
    const localities = METRO_CITIES[targetCity] || [targetCity];
    
    places.forEach(p => {
      // Check locality field first, then address
      const locName = p.locality || p.address;
      const addr = locName.toLowerCase();
      
      for (const loc of localities) {
        if (addr.includes(loc.toLowerCase())) {
          localityStats[loc] = (localityStats[loc] || 0) + 1;
          break; // Count only the first matching locality
        }
      }
    });

    console.log('Locality Distribution (Top 10):');
    Object.entries(localityStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([loc, count]) => console.log(`  - ${loc}: ${count}`));

    for (const place of places) {
      await scrapePlace(place, options.platform);
      // Add a small delay to be polite
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\nScraping completed.');

  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
