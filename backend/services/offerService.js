const stringSimilarity = require('string-similarity');
const zomatoScraper = require('./scrapers/zomato');
const swiggyScraper = require('./scrapers/swiggy');
const magicpinScraper = require('./scrapers/magicpin');
const districtScraper = require('./scrapers/district');
const cache = require('../utils/cache');

const CACHE_TTL = 3600; // 1 hour in seconds

class OfferService {
  constructor() {
    this.scrapers = [zomatoScraper, swiggyScraper, magicpinScraper, districtScraper];
  }

  async getBestOffers(placeName, city, location) {
    const cacheKey = `offers:${city}:${placeName}`.toLowerCase();

    // Check Cache
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from all scrapers in parallel
    const results = await Promise.allSettled(
      this.scrapers.map(scraper => scraper.getOffers(placeName, city, location))
    );

    let allOffers = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allOffers = allOffers.concat(result.value);
      }
    });

    // Filter and Rank Offers
    const rankedOffers = this.processOffers(allOffers, placeName);

    // Save to Cache
    await this.saveToCache(cacheKey, JSON.stringify(rankedOffers));

    return rankedOffers;
  }

  processOffers(offers, targetPlaceName) {
    // 1. Filter by name similarity to ensure we didn't scrape a wrong place
    const validOffers = offers.filter(offer => {
      const similarity = stringSimilarity.compareTwoStrings(offer.placeName.toLowerCase(), targetPlaceName.toLowerCase());
      return similarity > 0.6; // Threshold
    });

    // 2. Parse discount values to numbers for sorting
    validOffers.forEach(offer => {
      offer.effectiveDiscount = this.parseDiscount(offer.discountValue);
    });

    // 3. Sort by effective discount (descending)
    return validOffers.sort((a, b) => b.effectiveDiscount - a.effectiveDiscount);
  }

  parseDiscount(discountString) {
    // Extract number from strings like "50% Off", "Flat 100", etc.
    // This is a heuristic.
    if (!discountString) return 0;
    const match = discountString.match(/(\d+)%/);
    if (match) return parseInt(match[1], 10);
    
    // Handle flat amounts if needed, but percentage is easier to compare
    return 0;
  }

  async getFromCache(key) {
    return await cache.get(key);
  }

  async saveToCache(key, value) {
    await cache.set(key, value, CACHE_TTL);
  }
}

module.exports = new OfferService();
