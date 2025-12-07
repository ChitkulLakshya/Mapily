# Foursquare API Migration Summary

## Overview
This document summarizes the migration from OpenStreetMap/Overpass API to Foursquare Places API for fetching restaurant data.

## Changes Made

### 1. MongoDB Schema Update (`placeModel.js`)
- **Removed OSM-specific fields**: `osm_id`, `osm_type`, `place_id`, `active`, `inactive_since`, `last_updated`, `tags`, `maps_url`, `createdAt`
- **Added Foursquare fields**: `fsq_id` (unique identifier for duplicate detection)
- **Updated field names**: `maps_url` → `google_maps_link`
- **Collection name**: Set to `restaurants` as required
- **Field types**: `latitude`, `longitude`, and `rating` are now strings (as per requirements)

### 2. API Integration (`autoImporter.js`)
- **Replaced Overpass API** with Foursquare Places API v3
- **Search endpoint**: `GET https://api.foursquare.com/v3/places/search?fields=fsq_id,name,location,geocodes,categories,website,rating,popularity`
  - Uses the recommended endpoint format with `fields` parameter for optimal performance
  - Requests only necessary fields: `fsq_id`, `name`, `location`, `geocodes`, `categories`, `website`, `rating`, `popularity`
- **Photo endpoint**: `GET https://api.foursquare.com/v3/places/{fsq_id}/photos?fields=prefix,suffix`
- **Authentication**: Uses `Authorization: Bearer {API_KEY}` header
- **Category filter**: Uses category ID `13000` (Food)
- **Allowed categories**: Food, Restaurant, Café, Bakery, Fast Food

### 3. Data Processing
- **Location search**: Supports city names (`near`) or coordinates (`ll`)
- **Photo fetching**: Fetches first photo and stores URL only (no download)
- **Google Maps links**: Generated using format `https://www.google.com/maps/search/?api=1&query={lat},{lng}`
- **Duplicate handling**: Uses `fsq_id` to detect and update existing restaurants

### 4. Scheduling (`scheduledImporter.js`)
- **Frequency**: Changed from daily to **weekly** (Monday at 2:00 AM)
- **Cron expression**: `'0 0 2 * * 1'` (every Monday at 2 AM)

## Required Environment Variables

Create a `.env` file in the `backend` directory:

```env
FOURSQUARE_API_KEY=your_foursquare_api_key_here
MONGODB_URI=your_mongodb_connection_string
SEARCH_LOCATION=Hyderabad, India  # Optional: city name or "lat,lng"
```

## Getting Foursquare API Key

1. Sign up at https://developer.foursquare.com/
2. Create a new app
3. Copy your API key to the `.env` file

## Usage

### Manual Execution
```bash
cd backend
node importer/autoImporter.js
```

### Automatic Weekly Execution
The importer runs automatically when the server starts:
```bash
cd backend
npm start
```

## Data Schema

Each document in the `restaurants` collection:

```javascript
{
  "name": "Restaurant Name",
  "category": "Restaurant",  // Food, Restaurant, Café, Bakery, Fast Food
  "address": "Full address string",
  "rating": "4.5",  // String format
  "latitude": "17.4443",  // String format
  "longitude": "78.3771",  // String format
  "photo_url": "https://.../original.jpg",
  "phone": "+1234567890",
  "website": "https://restaurant.com",
  "google_maps_link": "https://www.google.com/maps/search/?api=1&query=17.4443,78.3771",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "fsq_id": "4b1234567890"  // Unique Foursquare ID
}
```

## Weekly Automation Options

### Option 1: Node-cron (Already Configured)
The `scheduledImporter.js` file uses node-cron to run weekly. Just keep the server running.

### Option 2: Vercel Cron
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/import",
    "schedule": "0 2 * * 1"
  }]
}
```

### Option 3: Render Scheduler
Configure a scheduled job in Render dashboard to run:
```bash
node backend/importer/autoImporter.js
```

### Option 4: GitHub Actions
Create `.github/workflows/weekly-import.yml`:
```yaml
name: Weekly Restaurant Import
on:
  schedule:
    - cron: '0 2 * * 1'  # Every Monday at 2 AM
jobs:
  import:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm install
      - run: cd backend && node importer/autoImporter.js
        env:
          FOURSQUARE_API_KEY: ${{ secrets.FOURSQUARE_API_KEY }}
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
```

## Rate Limiting

The importer includes a 100ms delay between photo requests to avoid rate limiting. If you encounter rate limit errors, increase the delay in `autoImporter.js` (line 253).

## Testing

1. Set up your `.env` file with valid credentials
2. Run manually: `node backend/importer/autoImporter.js`
3. Check MongoDB `restaurants` collection for imported data
4. Verify all required fields are present

## Notes

- Only places with allowed categories are saved
- Photo URLs are stored, not downloaded
- Existing restaurants are updated, not duplicated
- The importer works for any city or bounding area via `SEARCH_LOCATION`

