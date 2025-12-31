const axios = require('axios');
const cheerio = require('cheerio');
const BaseScraper = require('./baseScraper');

class SwiggyScraper extends BaseScraper {
  constructor() {
    super('swiggy');
    this.baseUrl = 'https://www.swiggy.com';
  }

  async getOffers(placeName, city, location) {
    try {
      // Swiggy search URL
      const searchUrl = `${this.baseUrl}/search?query=${encodeURIComponent(placeName)}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const offers = [];

      // Swiggy uses Next.js, so data might be in a script tag
      const scriptData = $('#__NEXT_DATA__').html();
      if (scriptData) {
        const jsonData = JSON.parse(scriptData);
        // Traverse JSON to find restaurants and offers
        // This path is hypothetical and depends on Swiggy's current state structure
        const restaurants = jsonData?.props?.pageProps?.data?.restaurants || [];
        
        restaurants.forEach(rest => {
           if (rest.name.toLowerCase().includes(placeName.toLowerCase())) {
             const aggregatedDiscountInfo = rest.aggregatedDiscountInfoV3;
             if (aggregatedDiscountInfo) {
               const header = aggregatedDiscountInfo.header || '';
               const subHeader = aggregatedDiscountInfo.subHeader || '';
               
               offers.push(this.normalize({
                 placeName: rest.name,
                 offerTitle: `${header} ${subHeader}`,
                 discountValue: header,
                 deeplink: `${this.baseUrl}/restaurants/${rest.slugs.city}/${rest.slugs.restaurant}`
               }));
             }
           }
        });
      }

      return offers;

    } catch (error) {
      console.error(`Error scraping Swiggy for ${placeName}:`, error.message);
      return [];
    }
  }
}

module.exports = new SwiggyScraper();
