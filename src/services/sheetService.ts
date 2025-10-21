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
