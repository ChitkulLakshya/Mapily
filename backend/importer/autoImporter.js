// backend/importer/autoImporter.js

const axios = require('axios');
const mongoose = require('mongoose');
const Place = require('./placeModel');
require('dotenv').config();

// -------------------- CONFIG --------------------
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mapify';
let GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error('Error: GOOGLE_API_KEY is required in .env file');
  process.exit(1);
}

// Trim whitespace from API key
GOOGLE_API_KEY = GOOGLE_API_KEY.trim();

const DEFAULT_LOCATION = process.env.SEARCH_LOCATION || '17.4443,78.3771'; // lat,lon (Hyderabad)
const SEARCH_RADIUS = 5000; // meters
const SEARCH_LIMIT = 50; // Max results per type

// Google Places API base URLs
const GOOGLE_PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';
const PLACE_TYPES = ['cafe', 'restaurant']; // Search for both types

const ALLOWED_CATEGORIES = ['cafe', 'restaurant', 'Café', 'Restaurant', 'Food', 'Bakery', 'Fast Food'];

// -------------------- DATABASE --------------------
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// -------------------- FETCH PLACES --------------------
async function fetchPlacesFromGoogle(location, limit = SEARCH_LIMIT) {
  try {
    // Validate API key is loaded
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY.length === 0) {
      throw new Error('GOOGLE_API_KEY is not set or empty');
    }

    // Parse location coordinates
    const [lat, lon] = location.split(',').map(coord => parseFloat(coord.trim()));
    if (isNaN(lat) || isNaN(lon)) {
      throw new Error(`Invalid location format. Expected "lat,lon" but got: ${location}`);
    }

    console.log('Making Google Places API requests...');
    console.log('Location:', location);
    console.log('Radius:', SEARCH_RADIUS, 'meters');
    console.log('Types:', PLACE_TYPES.join(', '));

    const allPlaces = [];
    const placeIds = new Set(); // Track unique place IDs to avoid duplicates

    // Fetch places for each type (cafe and restaurant)
    for (const type of PLACE_TYPES) {
      try {
        const params = {
          location: `${lat},${lon}`,
          radius: SEARCH_RADIUS,
          type: type,
          key: GOOGLE_API_KEY
        };

        const response = await axios.get(`${GOOGLE_PLACES_API_BASE}/nearbysearch/json`, {
          params
        });

        if (response.data && response.data.status === 'OK' && Array.isArray(response.data.results)) {
          // Filter out duplicates and add to collection
          for (const place of response.data.results) {
            if (place.place_id && !placeIds.has(place.place_id)) {
              placeIds.add(place.place_id);
              allPlaces.push(place);
            }
          }
          console.log(`Fetched ${response.data.results.length} ${type} places`);
        } else if (response.data && response.data.status === 'ZERO_RESULTS') {
          console.log(`No ${type} places found`);
        } else if (response.data && response.data.status) {
          console.warn(`Google API status for ${type}:`, response.data.status);
          if (response.data.status === 'REQUEST_DENIED') {
            console.error('❌ API Key Error:', response.data.error_message || 'Invalid API key');
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching ${type} places:`, error.message);
      }
    }

    // Limit results if needed
    const limitedPlaces = allPlaces.slice(0, limit);
    console.log(`Total unique places found: ${limitedPlaces.length}`);
    return limitedPlaces;
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error('Google Places API Error:');
      console.error('Status:', status);
      console.error('Error Data:', JSON.stringify(errorData, null, 2));
      
      if (status === 403 || (errorData && errorData.status === 'REQUEST_DENIED')) {
        console.error('❌ Authentication Error: Invalid API key');
        console.error('Please check:');
        console.error('1. Your .env file contains GOOGLE_API_KEY');
        console.error('2. The API key is valid and has Places API enabled');
        console.error('3. There are no extra spaces or quotes in the .env file');
        console.error('4. The API key has proper billing enabled (if required)');
      } else if (status === 400) {
        console.error('Bad Request: Check your parameters (location, radius, type)');
      }
    } else if (error.request) {
      console.error('No response received from Google Places API');
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return [];
  }
}

// -------------------- FETCH PLACE DETAILS --------------------
async function fetchPlaceDetails(placeId) {
  try {
    const params = {
      place_id: placeId,
      fields: 'formatted_phone_number,website,international_phone_number',
      key: GOOGLE_API_KEY
    };

    const response = await axios.get(`${GOOGLE_PLACES_API_BASE}/details/json`, {
      params
    });

    if (response.data && response.data.status === 'OK' && response.data.result) {
      return response.data.result;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching details for place ${placeId}:`, error.message);
    return null;
  }
}

// -------------------- FETCH PHOTO --------------------
async function fetchPlacePhoto(photoReference) {
  if (!photoReference) return '';
  
  try {
    // Google Places Photo API
    // Max width 800px for good quality without being too large
    const photoUrl = `${GOOGLE_PLACES_API_BASE}/photo?maxwidth=800&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
    return photoUrl;
  } catch (error) {
    console.error(`Error generating photo URL:`, error.message);
    return '';
  }
}

// -------------------- PROCESS PLACE --------------------
async function processPlace(place, placeDetails, photoUrl) {
  // Extract coordinates
  const lat = place.geometry?.location?.lat?.toString() || '';
  const lon = place.geometry?.location?.lng?.toString() || '';

  // Get name
  const name = place.name || 'Unnamed Restaurant';

  // Get address
  const address = place.vicinity || place.formatted_address || 'Address not available';

  // Determine category from place types
  let category = 'Food';
  if (place.types && Array.isArray(place.types)) {
    // Check for cafe first, then restaurant
    if (place.types.includes('cafe')) {
      category = 'cafe';
    } else if (place.types.includes('restaurant') || place.types.includes('food')) {
      category = 'restaurant';
    } else {
      // Use first matching type
      const matchingType = place.types.find(type => 
        ALLOWED_CATEGORIES.some(allowed => 
          type.toLowerCase().includes(allowed.toLowerCase())
        )
      );
      if (matchingType) {
        category = matchingType;
      }
    }
  }

  // Get rating (Google provides rating)
  const rating = place.rating ? place.rating.toString() : '';

  // Get phone and website from place details
  const phone = placeDetails?.formatted_phone_number || placeDetails?.international_phone_number || '';
  const website = placeDetails?.website || '';

  // Generate Google Maps link using place_id format
  const googleMapsLink = place.place_id 
    ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
    : (lat && lon ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}` : '');

  return {
    fsq_id: place.place_id, // Use place_id as unique identifier
    name,
    category,
    address,
    rating,
    latitude: lat,
    longitude: lon,
    photo_url: photoUrl,
    phone,
    website,
    google_maps_link: googleMapsLink,
    updatedAt: new Date()
  };
}

// -------------------- SAVE OR UPDATE --------------------
async function saveOrUpdatePlace(processedPlace) {
  try {
    const existing = await Place.findOne({ fsq_id: processedPlace.fsq_id });
    if (existing) {
      const updated = await Place.findOneAndUpdate(
        { fsq_id: processedPlace.fsq_id },
        { ...processedPlace, updatedAt: new Date() },
        { new: true }
      );
      return { action: 'updated', place: updated };
    } else {
      const newPlace = new Place({ ...processedPlace, updatedAt: new Date() });
      await newPlace.save();
      return { action: 'created', place: newPlace };
    }
  } catch (error) {
    console.error(`Error saving/updating place ${processedPlace.name}:`, error.message);
    return { action: 'error', error: error.message };
  }
}

// -------------------- IMPORT PLACES --------------------
async function importPlaces(location) {
  console.log(`Importing places for location: ${location}`);
  if (!location.includes(',')) {
    console.error(`ERROR: Location must be "lat,lon". Got: ${location}`);
    return { created: 0, updated: 0, errors: 1, skipped: 0 };
  }

  const places = await fetchPlacesFromGoogle(location);
  console.log(`Found ${places.length} places from Google Places API`);

  if (places.length === 0) {
    console.warn('No places found. Check your coordinates and API key.');
    return { created: 0, updated: 0, errors: 0, skipped: 0 };
  }

  let created = 0, updated = 0, errors = 0, skipped = 0;

  for (const place of places) {
    try {
      // Skip places without place_id
      if (!place.place_id) {
        console.warn(`Skipping place without place_id: ${place.name || 'Unknown'}`);
        skipped++;
        continue;
      }

      // Fetch place details for phone and website
      const placeDetails = await fetchPlaceDetails(place.place_id);
      await new Promise(res => setTimeout(res, 200)); // avoid rate limit

      // Get photo URL from first photo reference
      const photoReference = place.photos && place.photos.length > 0 
        ? place.photos[0].photo_reference 
        : null;
      const photoUrl = await fetchPlacePhoto(photoReference);

      // Process the place
      const processed = await processPlace(place, placeDetails, photoUrl);

      // Save or update
      const result = await saveOrUpdatePlace(processed);

      if (result.action === 'created') created++;
      else if (result.action === 'updated') updated++;
      else if (result.action === 'error') {
        errors++;
        console.error(`Error saving place: ${processed.name}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(res => setTimeout(res, 100));
    } catch (error) {
      console.error(`Error processing place ${place.name || place.place_id}:`, error.message);
      errors++;
    }
  }

  console.log(`\n=== Import Summary ===`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`=====================\n`);

  return { created, updated, errors, skipped };
}

// -------------------- RUN FULL IMPORT --------------------
async function runFullImport(location = DEFAULT_LOCATION) {
  console.log('Starting Google Places API auto-import...');
  console.log('Location:', location);
  console.log('Radius:', SEARCH_RADIUS, 'meters');
  console.log('Types:', PLACE_TYPES.join(', '));
  console.log('---\n');

  await connectToDatabase();

  const result = await importPlaces(location);

  await mongoose.connection.close();
  console.log('Database connection closed.');
  return result;
}

// Run directly
if (require.main === module) {
  runFullImport().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runFullImport };
