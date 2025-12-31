const axios = require('axios');
const cheerio = require('cheerio');
const BaseScraper = require('./baseScraper');
const puppeteer = require('puppeteer');

class ZomatoScraper extends BaseScraper {
  constructor() {
    super('zomato');
    this.baseUrl = 'https://www.zomato.com';
  }

  async getOffers(placeName, city, location) {
    try {
      // 1. Search for the place to get the URL
      // Note: Zomato search often requires headers/cookies or Puppeteer
      const searchUrl = `${this.baseUrl}/${city.toLowerCase()}/restaurants?q=${encodeURIComponent(placeName)}`;
      
      // Attempt with Axios first (likely to be blocked or get a captcha)
      try {
        const response = await axios.get(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        return this.parseSearchPage(response.data, placeName);
      } catch (error) {
        console.log('Zomato Axios scrape failed, falling back to Puppeteer...');
        return await this.scrapeWithPuppeteer(searchUrl, placeName);
      }

    } catch (error) {
      console.error(`Error scraping Zomato for ${placeName}:`, error.message);
      return [];
    }
  }

  parseSearchPage(html, placeName) {
    const $ = cheerio.load(html);
    const offers = [];
    
    // Logic to find the correct restaurant card and extract offers
    // Selectors are hypothetical and need to be updated based on live site
    $('.search-result-card').each((i, el) => {
      const name = $(el).find('.res-name').text().trim();
      if (name.toLowerCase().includes(placeName.toLowerCase())) {
        const offerText = $(el).find('.offer-text').text().trim();
        if (offerText) {
          offers.push(this.normalize({
            placeName: name,
            offerTitle: offerText,
            discountValue: offerText.match(/\d+%/) ? offerText.match(/\d+%/)[0] : 'Check details',
            deeplink: this.baseUrl + $(el).find('a').attr('href')
          }));
        }
      }
    });
    
    return offers;
  }

  async scrapeWithPuppeteer(url, placeName) {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Wait for results
      await page.waitForSelector('div[class*="sc-"]', { timeout: 5000 });

      const offers = await page.evaluate((placeName) => {
        const results = [];
        // This logic runs in the browser context
        // Need to inspect Zomato's DOM to get real class names
        const cards = document.querySelectorAll('div[class*="search-card"]'); 
        
        cards.forEach(card => {
          const nameEl = card.querySelector('h4');
          if (nameEl && nameEl.innerText.toLowerCase().includes(placeName.toLowerCase())) {
             const offerEl = card.querySelector('.offer-text-class'); // Placeholder class
             if (offerEl) {
               results.push({
                 placeName: nameEl.innerText,
                 offerTitle: offerEl.innerText,
                 discountValue: 'See App', // Extraction logic needed
                 deeplink: card.querySelector('a') ? card.querySelector('a').href : ''
               });
             }
          }
        });
        return results;
      }, placeName);

      return offers.map(o => this.normalize(o));

    } catch (error) {
      console.error('Puppeteer scraping failed:', error);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }
}

module.exports = new ZomatoScraper();
