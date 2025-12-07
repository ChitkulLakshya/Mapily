// sheetService.ts
/**
 * Fetch places by category from MongoDB via backend API
 * @param category Category name (e.g., "Restaurants", "Cafes")
 */
export const fetchPlacesByCategory = async (category: string): Promise<any[]> => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

  try {
    const response = await fetch(`${API_URL}/places/${encodeURIComponent(category)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch places: ${response.statusText}`);
    }

    const data = await response.json();

    // Make sure we return only the array of places
    return data.places || [];
  } catch (error) {
    console.error("Error fetching places by category from MongoDB:", error);
    return [];
  }
};
