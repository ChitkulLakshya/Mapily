const express = require('express');
const router = express.Router();
const offerService = require('../services/offerService');

// GET /offers?place=Dominos&city=Bangalore&location=Indiranagar
router.get('/', async (req, res) => {
  try {
    const { place, city, location } = req.query;

    if (!place || !city) {
      return res.status(400).json({ error: 'Missing required query parameters: place, city' });
    }

    const offers = await offerService.getBestOffers(place, city, location || '');
    
    res.json({
      query: { place, city, location },
      count: offers.length,
      offers: offers
    });

  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /offers/category/:category?city=Bangalore
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: 'Missing required query parameter: city' });
    }

    // Note: Searching by category is complex as it requires scraping lists of places first.
    // For now, we treat the category as a search term for the scrapers, 
    // which might return generic category offers or a list of places.
    // A better approach would be to have a database of places and iterate over them.
    
    const offers = await offerService.getBestOffers(category, city, '');

    res.json({
      category,
      city,
      offers
    });

  } catch (error) {
    console.error('Error fetching category offers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
