import type { Place } from "@/pages/Places";

/**
 * Fetch data from Google Sheets CSV (public)
 * No API key required
 */
export const fetchPlacesFromSheet = async (): Promise<Place[]> => {
  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8Lzi-9o4b4-Xqj2N0VZDtIqeKJCDfgmBkc04Pys51eHQS7haaUwXyekEoz-l-HdYqrz5_6rBiAGYG/pub?output=csv";

  try {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    const rows = csvText.split("\n").map((row) => row.split(","));

    // Remove header (first row)
    rows.shift();

    const places: Place[] = rows.map((row) => ({
      category: row[0]?.trim() || "",
      name: row[1]?.trim() || "",
      address: row[2]?.trim() || "",
      rating: parseFloat(row[3]) || 0,
      imageURL: row[4]?.trim() || "",
      description: row[5]?.trim() || "",
      mapsURL: row[6] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row[2] || '')}`,
    }));

    return places;
  } catch (error) {
    console.error("Error fetching CSV sheet:", error);
    return [];
  }
};

/**
 * Fetch places from Google Places API through our backend
 * @param query Search query (e.g., "Cafes in Gachibowli")
 * @param category Category to assign to places
 */
export const fetchPlacesFromGoogleAPI = async (query: string, category: string): Promise<any[]> => {
  try {
    const response = await fetch('http://localhost:3001/api/places/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, category }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch places');
    }

    return data.places;
  } catch (error) {
    console.error("Error fetching places from Google API:", error);
    throw error;
  }
};
