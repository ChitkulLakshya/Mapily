# Data Reformatter for MongoDB Import

This script reformats existing restaurant/cafe data into CSV or JSON format ready for MongoDB import.

## Output Format

The script generates data with the following columns in exact order:

1. **Name** - Restaurant/Cafe name
2. **Links** - Website or Google Maps link
3. **Cost** - Price range (if available)
4. **Collections** - Category/Collection name
5. **Cuisines** - Cuisine types
6. **Timings** - Opening hours (if available)
7. **Photo_URL** - Photo URL

## Usage

### Option 1: Format data from MongoDB

Reformat existing data from your MongoDB database:

```bash
cd backend
node importer/dataReformatter.js
```

This will:
- Connect to MongoDB
- Fetch all places from the `restaurants` collection
- Generate `formatted_data.csv` in the `backend/importer/` directory

### Option 2: Format data from input file

Reformat data from a CSV or JSON file:

```bash
# From CSV file
node importer/dataReformatter.js path/to/your/data.csv

# From JSON file
node importer/dataReformatter.js path/to/your/data.json

# Output as JSON instead of CSV
node importer/dataReformatter.js path/to/your/data.csv --json
```

### Option 3: Format data from Google Sheets

Reformat data directly from a Google Sheets CSV URL:

```bash
# From Google Sheets (CSV output)
node importer/dataReformatter.js "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"

# From Google Sheets (JSON output)
node importer/dataReformatter.js "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv" --json
```

## Input File Format

The script can read CSV or JSON files and automatically map common field names:

**Supported field name variations:**
- Name: `Name`, `name`, `restaurant_name`, `cafe_name`
- Links: `Links`, `links`, `website`, `url`, `google_maps_link`
- Cost: `Cost`, `cost`, `price_range`, `price`
- Collections: `Collections`, `collections`, `category`, `type`
- Cuisines: `Cuisines`, `cuisines`, `cuisine`, `food_type`
- Timings: `Timings`, `timings`, `hours`, `opening_hours`, `schedule`
- Photo_URL: `Photo_URL`, `photo_url`, `photo`, `image`, `image_url`

## Output Files

- **CSV**: `backend/importer/formatted_data.csv`
- **JSON**: `backend/importer/formatted_data.json` (when using `--json` flag)

## CSV Formatting

- Fields with commas, quotes, or newlines are properly escaped
- Empty fields are left blank (not removed)
- All special characters are preserved
- Ready for direct MongoDB import

## Example Output

**CSV Format:**
```csv
Name,Links,Cost,Collections,Cuisines,Timings,Photo_URL
"Restaurant Name","https://maps.google.com/...","","restaurant","Italian","","https://photo.url/..."
```

**JSON Format:**
```json
[
  {
    "Name": "Restaurant Name",
    "Links": "https://maps.google.com/...",
    "Cost": "",
    "Collections": "restaurant",
    "Cuisines": "Italian",
    "Timings": "",
    "Photo_URL": "https://photo.url/..."
  }
]
```

## MongoDB Import

After generating the formatted file, you can import it using:

### Using mongoimport (CSV):
```bash
mongoimport --uri="your_mongodb_uri" --collection=restaurants --type=csv --headerline --file=backend/importer/formatted_data.csv
```

### Using Mongoose (JSON):
```javascript
const data = require('./formatted_data.json');
const Place = require('./placeModel');

// Import each record
for (const item of data) {
  const place = new Place({
    name: item.Name,
    // Map other fields as needed
  });
  await place.save();
}
```

## Notes

- Missing fields are left blank (empty strings)
- All rows are preserved (no rows are removed)
- CSV properly handles commas and special characters
- The script maintains data integrity

