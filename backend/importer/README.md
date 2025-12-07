# Automatic Food Place Importer (Foursquare API)

This is a fully automatic importer that fetches food places from Foursquare Places API and saves them to MongoDB without any manual intervention.

## How It Works

1. The importer runs automatically **once per week** (every Monday at 2:00 AM)
2. It searches for food places using Foursquare Places API v3 with the new required format:
   - Endpoint: `https://api.foursquare.com/v3/places/search`
   - **Mandatory Parameters**:
     - `ll`: Latitude,Longitude (e.g., "17.4443,78.3771")
     - `radius`: 5000 (meters)
     - `categories`: 13065,13032,13034 (Restaurant, Fast Food, Café)
     - `fields`: fsq_id,name,location,geocodes,categories,website,popularity
     - `limit`: 50
3. It fetches place details including:
   - Name
   - Category (Cuisine type)
   - Address
   - Rating
   - Latitude/Longitude
   - Photo URL
   - Phone
   - Website
   - Google Maps Link
4. It saves new places to MongoDB and updates existing ones (no duplicates)
5. Only stores photo URLs, does not download/upload photos

## Setup Instructions

1. **Get Foursquare API Key**
   - Sign up at https://developer.foursquare.com/
   - Create a new app to get your API key

2. **Configure Environment Variables**
   Create or update the `.env` file in the `backend` directory:
   ```env
   FOURSQUARE_API_KEY=your_foursquare_api_key_here
   MONGODB_URI=your_mongodb_atlas_connection_string
   SEARCH_LOCATION=17.4443,78.3771  # REQUIRED: "lat,lng" coordinates (e.g., Hyderabad)
   ```
   
   **Important**: The new Foursquare API v3 requires coordinates in "lat,lon" format, not city names.
   Examples:
   - Hyderabad: `17.4443,78.3771`
   - New York: `40.7128,-74.0060`
   - London: `51.5074,-0.1278`

3. **Start the Server**
   ```bash
   cd backend
   npm start
   ```

4. **The importer will run automatically**
   - Weekly on Monday at 2:00 AM
   - No manual intervention required

## Manual Execution

To run the importer manually (for testing):
```bash
cd backend
node importer/autoImporter.js
```

## Data Model

Each place document in MongoDB (collection: `restaurants`) contains:
- `name` - Restaurant name
- `category` - Cuisine type (Food, Restaurant, Café, Bakery, Fast Food)
- `address` - Full address
- `rating` - Rating as string
- `latitude` - Latitude as string
- `longitude` - Longitude as string
- `photo_url` - URL to restaurant photo
- `phone` - Phone number
- `website` - Website URL
- `google_maps_link` - Generated Google Maps link
- `updatedAt` - Last update timestamp
- `fsq_id` - Foursquare place ID (unique identifier)

## Allowed Categories

The importer only saves places with these categories:
- Food
- Restaurant
- Café
- Bakery
- Fast Food

## Duplicate Prevention

The importer checks for existing places using the `fsq_id` field before saving. If a place already exists, it updates the existing record instead of creating a duplicate.

## Customization

### Change Location

Set the `SEARCH_LOCATION` environment variable:
- City name: `SEARCH_LOCATION=New York, USA`
- Coordinates: `SEARCH_LOCATION=40.7128,-74.0060`

### Change Schedule

Modify the cron expression in `scheduledImporter.js`:
- Weekly on Monday: `'0 0 2 * * 1'`
- Daily: `'0 0 2 * * *'`
- Every Sunday: `'0 0 2 * * 0'`

## Weekly Automation Options

You can set up weekly automation using:

1. **Vercel Cron** - Add to `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron/import",
       "schedule": "0 2 * * 1"
     }]
   }
   ```

2. **Render Scheduler** - Configure in Render dashboard

3. **GitHub Actions** - Create `.github/workflows/weekly-import.yml`

4. **Node-cron** - Already configured in `scheduledImporter.js`

## API Rate Limiting

The importer includes a 100ms delay between photo requests to avoid rate limiting. If you encounter rate limit errors, increase the delay in `autoImporter.js`.