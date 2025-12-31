# Mapify Automatic Importer Backend

This backend service provides a fully automatic importer that fetches places from Google Places API and saves them to MongoDB Atlas on a schedule.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the backend directory with the following variables:
   ```
   GOOGLE_PLACES_API_KEY=your_google_places_api_key
   MONGODB_URI=your_mongodb_atlas_connection_string
   PORT=3003
   
   # Optional: Redis Caching
   USE_REDIS=false
   # REDIS_URL=redis://localhost:6379
   ```

3. **Start the Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

## Caching (Redis vs In-Memory)

By default, the application uses an **in-memory cache** which works out of the box without any external dependencies.

### Enabling Redis (Optional)
To use Redis for distributed caching:

1. **Install Redis** (or use Docker):
   ```bash
   docker run --name mapily-redis -p 6379:6379 -d redis
   ```

2. **Update .env**:
   ```env
   USE_REDIS=true
   REDIS_URL=redis://localhost:6379
   ```

The system handles failures gracefully. If Redis goes down, it automatically falls back to in-memory caching and logs the error only once to avoid console spam.

## Automatic Importer

The importer runs automatically every 24 hours at 2:00 AM. It:

1. Loops through predefined food categories
2. Generates search queries like "Cafes near Hyderabad"
3. Fetches place data from Google Places API
4. Saves new places to MongoDB Atlas (preventing duplicates)

No manual intervention is required - the system runs completely automatically.

## Development

The backend uses:
- Express.js for the web server
- Google Places API for fetching place data
- MongoDB Atlas for saving data
- dotenv for environment configuration