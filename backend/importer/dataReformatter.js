// backend/importer/dataReformatter.js
// Script to reformat existing restaurant/cafe data for MongoDB import

const mongoose = require('mongoose');
const Place = require('./placeModel');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// -------------------- CONFIG --------------------
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mapify';

// -------------------- DATABASE --------------------
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// -------------------- ESCAPE CSV FIELD --------------------
function escapeCsvField(field) {
  if (field === null || field === undefined) {
    return '';
  }
  
  const str = String(field);
  
  // If field contains comma, newline, or double quote, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

// -------------------- FORMAT DATA FROM MONGODB --------------------
async function formatDataFromMongoDB(outputFormat = 'csv') {
  try {
    await connectToDatabase();
    
    console.log('Fetching data from MongoDB...');
    const places = await Place.find({}).lean();
    console.log(`Found ${places.length} places in database`);
    
    if (places.length === 0) {
      console.log('No data found in MongoDB. Please import data first.');
      await mongoose.connection.close();
      return;
    }
    
    // Format data according to requirements
    const formattedData = places.map(place => {
      // Map existing fields to new format
      const formatted = {
        Name: place.name || '',
        Links: place.google_maps_link || place.website || '',
        Cost: '', // Not in current schema - leave blank
        Collections: place.category || '',
        Cuisines: place.category || '', // Using category as cuisine
        Timings: '', // Not in current schema - leave blank
        Photo_URL: place.photo_url || ''
      };
      
      return formatted;
    });
    
    // Generate output
    if (outputFormat === 'csv') {
      generateCSV(formattedData);
    } else {
      generateJSON(formattedData);
    }
    
    await mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error formatting data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// -------------------- GENERATE CSV --------------------
function generateCSV(data) {
  const headers = ['Name', 'Links', 'Cost', 'Collections', 'Cuisines', 'Timings', 'Photo_URL'];
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(item => {
    const row = headers.map(header => escapeCsvField(item[header] || ''));
    csvContent += row.join(',') + '\n';
  });
  
  // Write to file
  const outputPath = path.join(__dirname, 'formatted_data.csv');
  fs.writeFileSync(outputPath, csvContent, 'utf8');
  
  console.log(`\n✅ CSV file generated: ${outputPath}`);
  console.log(`Total rows: ${data.length}`);
  console.log(`Columns: ${headers.join(', ')}`);
}

// -------------------- GENERATE JSON --------------------
function generateJSON(data) {
  const outputPath = path.join(__dirname, 'formatted_data.json');
  
  // Format as array of objects
  const jsonData = data.map(item => ({
    Name: item.Name || '',
    Links: item.Links || '',
    Cost: item.Cost || '',
    Collections: item.Collections || '',
    Cuisines: item.Cuisines || '',
    Timings: item.Timings || '',
    Photo_URL: item.Photo_URL || ''
  }));
  
  fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf8');
  
  console.log(`\n✅ JSON file generated: ${outputPath}`);
  console.log(`Total records: ${jsonData.length}`);
}

// -------------------- FORMAT DATA FROM INPUT FILE --------------------
async function formatDataFromFile(inputFilePath, outputFormat = 'csv') {
  try {
    console.log(`Reading data from: ${inputFilePath}`);
    
    const fileExtension = path.extname(inputFilePath).toLowerCase();
    let data = [];
    
    if (fileExtension === '.json') {
      // Read JSON file
      const fileContent = fs.readFileSync(inputFilePath, 'utf8');
      data = JSON.parse(fileContent);
    } else if (fileExtension === '.csv') {
      // Read CSV file (simple parser)
      const fileContent = fs.readFileSync(inputFilePath, 'utf8');
      const lines = fileContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    } else {
      throw new Error('Unsupported file format. Please use .json or .csv');
    }
    
    console.log(`Loaded ${data.length} records from file`);
    
    // Map to required format
    const formattedData = data.map(item => {
      // Try to map common field names to required format
      const formatted = {
        Name: item.Name || item.name || item.restaurant_name || item.cafe_name || '',
        Links: item.Links || item.links || item.website || item.url || item.google_maps_link || '',
        Cost: item.Cost || item.cost || item.price_range || item.price || '',
        Collections: item.Collections || item.collections || item.category || item.type || '',
        Cuisines: item.Cuisines || item.cuisines || item.cuisine || item.food_type || item.category || '',
        Timings: item.Timings || item.timings || item.hours || item.opening_hours || item.schedule || '',
        Photo_URL: item.Photo_URL || item.photo_url || item.photo || item.image || item.image_url || ''
      };
      
      return formatted;
    });
    
    // Generate output
    if (outputFormat === 'csv') {
      generateCSV(formattedData);
    } else {
      generateJSON(formattedData);
    }
    
    console.log('\n✅ Data reformatted successfully!');
  } catch (error) {
    console.error('Error processing file:', error.message);
    process.exit(1);
  }
}

// -------------------- PARSE CSV LINE --------------------
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  values.push(current.trim());
  
  return values;
}

// -------------------- FORMAT DATA FROM GOOGLE SHEETS --------------------
async function formatDataFromGoogleSheets(sheetUrl, outputFormat = 'csv') {
  try {
    console.log(`Fetching data from Google Sheets: ${sheetUrl}`);
    
    const response = await axios.get(sheetUrl);
    const csvText = response.data;
    
    // Parse CSV
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('No data found in Google Sheets');
    }
    
    const headers = parseCSVLine(lines[0]);
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    
    console.log(`Loaded ${data.length} records from Google Sheets`);
    
    // Map to required format
    const formattedData = data.map(item => {
      const formatted = {
        Name: item.Name || item.name || item['Restaurant Name'] || item['Cafe Name'] || '',
        Links: item.Links || item.links || item.website || item.url || item['Google Maps'] || item['Maps URL'] || '',
        Cost: item.Cost || item.cost || item.price_range || item.price || item['Price Range'] || '',
        Collections: item.Collections || item.collections || item.category || item.type || item.Category || '',
        Cuisines: item.Cuisines || item.cuisines || item.cuisine || item.food_type || item['Food Type'] || item.category || '',
        Timings: item.Timings || item.timings || item.hours || item.opening_hours || item.schedule || item['Opening Hours'] || '',
        Photo_URL: item.Photo_URL || item.photo_url || item.photo || item.image || item.image_url || item['Photo URL'] || item['Image URL'] || ''
      };
      
      return formatted;
    });
    
    // Generate output
    if (outputFormat === 'csv') {
      generateCSV(formattedData);
    } else {
      generateJSON(formattedData);
    }
    
    console.log('\n✅ Data reformatted successfully from Google Sheets!');
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error.message);
    process.exit(1);
  }
}

// -------------------- MAIN --------------------
async function main() {
  const args = process.argv.slice(2);
  const outputFormat = args.includes('--json') ? 'json' : 'csv';
  const inputFile = args.find(arg => !arg.startsWith('--') && !arg.startsWith('http'));
  const sheetUrl = args.find(arg => arg.startsWith('http'));
  
  console.log('=== Data Reformatter for MongoDB Import ===\n');
  
  if (sheetUrl) {
    // Format from Google Sheets URL
    await formatDataFromGoogleSheets(sheetUrl, outputFormat);
  } else if (inputFile) {
    // Format from input file
    await formatDataFromFile(inputFile, outputFormat);
  } else {
    // Format from MongoDB
    await formatDataFromMongoDB(outputFormat);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { formatDataFromMongoDB, formatDataFromFile, formatDataFromGoogleSheets };

