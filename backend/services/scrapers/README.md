# Scraper Modules & Legal Disclaimer

This directory contains scraper modules for fetching dining offers from various platforms.

## ⚠️ Legal & Ethical Disclaimer

**Important:** Scraping data from third-party websites (Zomato, Swiggy, Magicpin, etc.) may violate their **Terms of Service (ToS)**.

1.  **Terms of Service**: Most platforms explicitly prohibit automated access, scraping, or data extraction in their ToS.
2.  **Intellectual Property**: The data (restaurant lists, reviews, photos) is often proprietary.
3.  **Rate Limiting**: Aggressive scraping can degrade service for legitimate users and may lead to IP bans.

### Recommendations for Production Use:
*   **Official APIs**: Always prefer official Partner APIs if available (e.g., Swiggy/Zomato Partner APIs).
*   **Rate Limiting**: Ensure your scrapers respect `robots.txt` and implement strict rate limiting (e.g., 1 request per few seconds).
*   **Caching**: Heavily cache results (Redis is implemented) to minimize hits to the source.
*   **User-Agent**: Use a descriptive User-Agent string so site admins can contact you if needed.
*   **Headless Browsers**: If using Puppeteer, be aware it is resource-intensive and easier to detect.

## Architecture

*   **BaseScraper**: Abstract class defining the interface.
*   **Platform Scrapers**: Implementations for specific sites.
    *   `zomato.js`: Includes a Puppeteer fallback for dynamic content.
    *   `swiggy.js`: Targets JSON data embedded in the page.
    *   `magicpin.js`: Standard HTML parsing.
*   **OfferService**: Orchestrates the scraping, normalizes data, and handles caching.

## Usage

The `OfferService` is the main entry point. It runs scrapers in parallel and aggregates results.

```javascript
const offerService = require('../services/offerService');
const offers = await offerService.getBestOffers('Dominos', 'Bangalore', 'Indiranagar');
```
