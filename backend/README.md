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
   ```

3. **Start the Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

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