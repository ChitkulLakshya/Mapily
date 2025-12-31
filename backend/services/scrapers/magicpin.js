const axios = require('axios');
const cheerio = require('cheerio');
const BaseScraper = require('./baseScraper');

class MagicpinScraper extends BaseScraper {
  constructor() {
    super('magicpin');
    this.baseUrl = 'https://magicpin.in';
  }

  async getOffers(placeName, city, location) {
    try {
      // Magicpin URL structure: /<city>/<location>/<category>/<place-name>/store/<id>
      // We need to search first.
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(placeName)}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const offers = [];

      // Parse search results
      $('.merchant-profile').each((i, el) => {
        const name = $(el).find('.merchant-name').text().trim();
        if (name.toLowerCase().includes(placeName.toLowerCase())) {
           const offerText = $(el).find('.offer-section').text().trim();
           const link = $(el).find('a').attr('href');
           
           if (offerText) {
             offers.push(this.normalize({
               placeName: name,
               offerTitle: offerText,
               discountValue: offerText.match(/\d+%/) ? offerText.match(/\d+%/)[0] : 'Check App',
               deeplink: link ? (link.startsWith('http') ? link : this.baseUrl + link) : '#'
             }));
           }
        }
      });

      return offers;

    } catch (error) {
      console.error(`Error scraping Magicpin for ${placeName}:`, error.message);
      return [];
    }
  }

  async discoverPlaces(locality, city) {
    try {
      // Search for "Restaurants in [Locality], [City]"
      const query = `Restaurants in ${locality}, ${city}`;
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const places = [];

      $('.merchant-profile').each((i, el) => {
        const name = $(el).find('.merchant-name').text().trim();
        const localityText = $(el).find('.merchant-locality').text().trim();
        const link = $(el).find('a').attr('href');
        const image = $(el).find('img').attr('src');
        
        if (name) {
          places.push({
            name: name,
            address: `${localityText}, ${city}`,
            locality: locality,
            city: city,
            url: link ? (link.startsWith('http') ? link : this.baseUrl + link) : '',
            photo_url: image || '',
            source: 'magicpin'
          });
        }
      });

      return places;
    } catch (error) {
      console.error(`[Magicpin] Error discovering places in ${locality}:`, error.message);
      return [];
    }
  }
}

module.exports = new MagicpinScraper();
