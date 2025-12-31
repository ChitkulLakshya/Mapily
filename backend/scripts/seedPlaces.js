const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Place = require('../importer/placeModel');

const HYDERABAD_PLACES = [
  // Jubilee Hills
  { name: "Farzi Cafe", locality: "Jubilee Hills", category: "cafe", address: "Rd Number 59, Jubilee Hills, Hyderabad" },
  { name: "Tatva", locality: "Jubilee Hills", category: "restaurant", address: "Rd Number 36, Jubilee Hills, Hyderabad" },
  { name: "Concu", locality: "Jubilee Hills", category: "desserts", address: "Rd Number 37, Jubilee Hills, Hyderabad" },
  { name: "Churrolto", locality: "Jubilee Hills", category: "desserts", address: "Rd Number 45, Jubilee Hills, Hyderabad" },
  { name: "Zero40 Brewing", locality: "Jubilee Hills", category: "restaurant", address: "Rd Number 10, Jubilee Hills, Hyderabad" },

  // Banjara Hills
  { name: "Roastery Coffee House", locality: "Banjara Hills", category: "cafe", address: "Rd Number 14, Banjara Hills, Hyderabad" },
  { name: "Haiku", locality: "Banjara Hills", category: "restaurant", address: "Rd Number 12, Banjara Hills, Hyderabad" },
  { name: "Bikanervala", locality: "Banjara Hills", category: "snacks", address: "Rd Number 1, Banjara Hills, Hyderabad" },
  { name: "Labonel", locality: "Banjara Hills", category: "desserts", address: "Rd Number 12, Banjara Hills, Hyderabad" },
  { name: "Chinese Pavilion", locality: "Banjara Hills", category: "restaurant", address: "Rd Number 1, Banjara Hills, Hyderabad" },

  // Gachibowli
  { name: "Flechazo", locality: "Gachibowli", category: "restaurant", address: "Above Bajaj Electronics, Gachibowli, Hyderabad" },
  { name: "Shah Ghouse", locality: "Gachibowli", category: "restaurant", address: "Near Bio Diversity Park, Gachibowli, Hyderabad" },
  { name: "Drunken Monkey", locality: "Gachibowli", category: "cafe", address: "Indra Nagar, Gachibowli, Hyderabad" },
  { name: "Paradise Biryani", locality: "Gachibowli", category: "restaurant", address: "Gachibowli X Roads, Hyderabad" },
  { name: "Cream Stone", locality: "Gachibowli", category: "desserts", address: "Vinayak Nagar, Gachibowli, Hyderabad" },

  // Madhapur
  { name: "Karachi Bakery", locality: "Madhapur", category: "desserts", address: "Hitech City Rd, Madhapur, Hyderabad" },
  { name: "Absolute Barbecues", locality: "Madhapur", category: "restaurant", address: "Jubilee Enclave, Madhapur, Hyderabad" },
  { name: "Chutneys", locality: "Madhapur", category: "restaurant", address: "Hitech City Rd, Madhapur, Hyderabad" },
  { name: "10 Downing Street", locality: "Madhapur", category: "restaurant", address: "SLN Terminus, Madhapur, Hyderabad" },
  { name: "Subway", locality: "Madhapur", category: "fast_food", address: "Mindspace, Madhapur, Hyderabad" },

  // Secunderabad
  { name: "Alpha Hotel", locality: "Secunderabad", category: "restaurant", address: "Opp Railway Station, Secunderabad" },
  { name: "Paradise", locality: "Secunderabad", category: "restaurant", address: "SD Road, Secunderabad" },
  { name: "Blue Sea Tea & Snacks", locality: "Secunderabad", category: "snacks", address: "Regimental Bazaar, Secunderabad" },
  { name: "Grill 9", locality: "Secunderabad", category: "restaurant", address: "Karkhana, Secunderabad" },
  { name: "Pizza Hut", locality: "Secunderabad", category: "fast_food", address: "SD Road, Secunderabad" },

  // Sainikpuri
  { name: "The Coffee Cup", locality: "Sainikpuri", category: "cafe", address: "Sainikpuri, Secunderabad" },
  { name: "F3 Cafe & Bistro", locality: "Sainikpuri", category: "cafe", address: "Sainikpuri, Secunderabad" },
  { name: "Groove 9", locality: "Sainikpuri", category: "restaurant", address: "Sainikpuri, Secunderabad" },
  { name: "Eclaire", locality: "Sainikpuri", category: "desserts", address: "Sainikpuri, Secunderabad" },
  { name: "Fifth Avenue Bakers", locality: "Sainikpuri", category: "desserts", address: "Sainikpuri, Secunderabad" },

  // Kondapur
  { name: "Sante Spa Cuisine", locality: "Kondapur", category: "restaurant", address: "Kondapur, Hyderabad" },
  { name: "84 Anjuna Shack", locality: "Kondapur", category: "restaurant", address: "Kondapur, Hyderabad" },
  { name: "California Burrito", locality: "Kondapur", category: "fast_food", address: "Sarath City Mall, Kondapur, Hyderabad" },
  { name: "Taco Bell", locality: "Kondapur", category: "fast_food", address: "Sarath City Mall, Kondapur, Hyderabad" },
  { name: "Starbucks", locality: "Kondapur", category: "cafe", address: "Sarath City Mall, Kondapur, Hyderabad" },

  // Kukatpally
  { name: "Pista House", locality: "Kukatpally", category: "restaurant", address: "Kukatpally, Hyderabad" },
  { name: "McDonald's", locality: "Kukatpally", category: "fast_food", address: "Forum Sujana Mall, Kukatpally, Hyderabad" },
  { name: "KFC", locality: "Kukatpally", category: "fast_food", address: "Kukatpally, Hyderabad" },
  { name: "Burger King", locality: "Kukatpally", category: "fast_food", address: "Nexus Mall, Kukatpally, Hyderabad" },
  { name: "Cream Stone", locality: "Kukatpally", category: "desserts", address: "KPHB, Kukatpally, Hyderabad" },

  // Ameerpet
  { name: "Kakatiya Mess", locality: "Ameerpet", category: "restaurant", address: "Ameerpet, Hyderabad" },
  { name: "Sri Kanya", locality: "Ameerpet", category: "restaurant", address: "Ameerpet, Hyderabad" },
  { name: "Bawarchi", locality: "Ameerpet", category: "restaurant", address: "Ameerpet, Hyderabad" },
  { name: "Gokul Chat", locality: "Ameerpet", category: "snacks", address: "Ameerpet, Hyderabad" },
  { name: "Agra Sweets", locality: "Ameerpet", category: "desserts", address: "Ameerpet, Hyderabad" },

  // Himayatnagar
  { name: "Minerva Coffee Shop", locality: "Himayatnagar", category: "restaurant", address: "Himayatnagar, Hyderabad" },
  { name: "Chutneys", locality: "Himayatnagar", category: "restaurant", address: "Himayatnagar, Hyderabad" },
  { name: "McDonald's", locality: "Himayatnagar", category: "fast_food", address: "Himayatnagar, Hyderabad" },
  { name: "Domino's Pizza", locality: "Himayatnagar", category: "fast_food", address: "Himayatnagar, Hyderabad" },
  { name: "Melting Moments", locality: "Himayatnagar", category: "desserts", address: "Himayatnagar, Hyderabad" }
];

async function seedPlaces() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in .env');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing manual entries...');
    // Optional: Clear only manual entries to avoid wiping scraped data if any
    await Place.deleteMany({ source: 'manual' });

    console.log(`Seeding ${HYDERABAD_PLACES.length} places...`);

    const placesToInsert = HYDERABAD_PLACES.map(p => ({
      ...p,
      city: 'Hyderabad',
      source: 'manual',
      isActive: true,
      latitude: '0', // Dummy coordinates
      longitude: '0',
      google_maps_link: `https://maps.google.com/?q=${encodeURIComponent(p.name + ' ' + p.address)}`,
      fsq_id: `manual_${p.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    }));

    await Place.insertMany(placesToInsert);
    console.log('Seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding places:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedPlaces();
