const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  rating: {
    type: String,
    default: ''
  },
  latitude: {
    type: String,
    required: true
  },
  longitude: {
    type: String,
    required: true
  },
  photo_url: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  google_maps_link: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Keep fsq_id for duplicate detection
  fsq_id: {
    type: String,
    unique: true,
    sparse: true
  }
});

// Index for faster queries
placeSchema.index({ category: 1 });
placeSchema.index({ name: 1 });
placeSchema.index({ fsq_id: 1 });
placeSchema.index({ updatedAt: 1 });

module.exports = mongoose.model('Place', placeSchema, 'restaurants');