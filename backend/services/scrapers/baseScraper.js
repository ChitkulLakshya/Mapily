/**
 * Base Scraper Interface
 * All platform scrapers should implement these methods.
 */
class BaseScraper {
  constructor(platformName) {
    this.platform = platformName;
  }

  /**
   * Fetch offers for a specific place
   * @param {string} placeName - Name of the restaurant/place
   * @param {string} city - City name
   * @param {string} location - More specific location (e.g., "Indiranagar")
   * @returns {Promise<Array>} - Array of normalized offer objects
   */
  async getOffers(placeName, city, location) {
    throw new Error('getOffers must be implemented by subclass');
  }

  /**
   * Discover places in a specific locality
   * @param {string} locality 
   * @param {string} city 
   * @returns {Promise<Array>} - Array of place objects { name, address, url, rating, cost }
   */
  async discoverPlaces(locality, city) {
    console.warn(`[${this.platform}] discoverPlaces not implemented, skipping.`);
    return [];
  }

  /**
   * Normalize raw data into the standard format
   * @param {Object} rawData 
   * @returns {Object} Normalized offer
   */
  normalize(rawData) {
    return {
      platform: this.platform,
      placeName: rawData.placeName,
      category: rawData.category || 'General',
      offerTitle: rawData.offerTitle,
      discountValue: rawData.discountValue,
      terms: rawData.terms || '',
      validTill: rawData.validTill || null,
      deeplink: rawData.deeplink || '#'
    };
  }
}

module.exports = BaseScraper;
