const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const placesRoutes = require('./routes/places');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes - Use /places instead of /api/places
app.use('/places', placesRoutes);

// Serve static files from the React app build directory (when deployed)
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Mapify API is running' });
});

// Catch-all handler for serving React app (when deployed)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Mapily API server running on port ${PORT}`);
  console.log('MongoDB: test/restaurants');
});