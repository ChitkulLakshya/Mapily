// backend/routes/places.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection - Use 'test' database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

// Connect to MongoDB
let db;
mongoose.connect(MONGODB_URI)
  .then(() => {
    // Get the database instance - using 'test' database
    db = mongoose.connection.db;
    console.log('MongoDB connected for places route');
    console.log('Database: test');
    console.log('Collection: restaurants');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

/**
 * Assign category based on keyword matching rules
 * Case-insensitive matching on Name and Cuisines fields
 * @param {Object} restaurant - MongoDB document
 * @returns {string} - Assigned category
 */
function assignCategory(restaurant) {
  const name = (restaurant.Name || '').toLowerCase();
  const cuisines = (restaurant.Cuisines || '').toLowerCase();
  const combined = `${name} ${cuisines}`;

  // Rule 1: Cafes
  if (combined.includes('cafe') || combined.includes('coffee') || combined.includes('tea')) {
    return 'Cafes';
  }

  // Rule 2: Food Trucks
  if (combined.includes('truck') || combined.includes('wheels')) {
    return 'Food Trucks';
  }

  // Rule 3: Breakfast
  if (combined.includes('breakfast') || combined.includes('tiffin')) {
    return 'Breakfast';
  }

  // Rule 4: Fast Food
  if (combined.includes('burger') || combined.includes('pizza') || combined.includes('fast')) {
    return 'Fast Food';
  }

  // Rule 5: Snacks
  if (combined.includes('snacks') || combined.includes('chaat')) {
    return 'Snacks';
  }

  // Rule 6: Desserts
  if (combined.includes('dessert') || combined.includes('cake') || combined.includes('pastry')) {
    return 'Desserts';
  }

  // Default: Restaurants
  return 'Restaurants';
}

/**
 * GET /places/:category
 * Fetch restaurants by category from test/restaurants collection
 * Applies keyword-based category assignment before filtering
 */
router.get('/:category', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const requestedCategory = decodeURIComponent(req.params.category);
    
    // Load ALL documents from test/restaurants collection
    const allRestaurants = await db.collection('restaurants')
      .find({})
      .toArray();

    // Apply category assignment based on keyword rules
    const restaurantsWithAssignedCategories = allRestaurants.map(restaurant => {
      // Use existing category if present and valid, otherwise assign based on keywords
      const existingCategory = restaurant.category || '';
      const validCategories = ['Cafes', 'Restaurants', 'Food Trucks', 'Breakfast', 'Fast Food', 'Snacks', 'Desserts'];
      
      let assignedCategory;
      if (existingCategory && validCategories.includes(existingCategory)) {
        // Use existing category if it's valid
        assignedCategory = existingCategory;
      } else {
        // Assign category based on keyword matching
        assignedCategory = assignCategory(restaurant);
      }

      return {
        ...restaurant,
        assignedCategory: assignedCategory
      };
    });

    // Filter documents where assignedCategory matches requested category
    const filteredRestaurants = restaurantsWithAssignedCategories.filter(
      restaurant => restaurant.assignedCategory === requestedCategory
    );

    // If no results, return empty array (not error)
    if (filteredRestaurants.length === 0) {
      return res.json({ places: [], count: 0 });
    }

    // Transform MongoDB documents to frontend format
    const places = filteredRestaurants.map(restaurant => ({
      Name: restaurant.Name || '',
      Links: restaurant.Links || '',
      Cost: restaurant.Cost || '',
      Collections: restaurant.Collections || '',
      Cuisines: restaurant.Cuisines || '',
      Timings: restaurant.Timings || '',
      Photo_URL: restaurant.Photo_URL || '',
      category: restaurant.assignedCategory
    }));

    res.json({ places, count: places.length });
  } catch (error) {
    console.error('Error fetching places by category:', error);
    res.status(500).json({ error: 'Failed to fetch places from database' });
  }
});

module.exports = router;

