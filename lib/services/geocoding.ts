// Geocoding service using OpenStreetMap Nominatim API (free alternative to Google Maps)
export interface GeocodeResult {
  latitude: number;
  longitude: number;
  display_name: string;
}

export async function geocodeAddress(
  address: string,
  city?: string,
  state?: string,
  country?: string
): Promise<GeocodeResult | null> {
  if (!address.trim()) {
    return null;
  }

  try {
    // Build a more complete address string
    let fullAddress = address.trim();

    if (city?.trim()) {
      fullAddress += `, ${city.trim()}`;
    }
    if (state?.trim()) {
      fullAddress += `, ${state.trim()}`;
    }
    if (country?.trim()) {
      fullAddress += `, ${country.trim()}`;
    }

    // Using Nominatim API (OpenStreetMap) - free and no API key required
    const encodedAddress = encodeURIComponent(fullAddress);
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;

    // Add country code for better accuracy if we have country info
    if (
      country?.toLowerCase().includes("united states") ||
      country?.toLowerCase().includes("usa") ||
      state
    ) {
      url += "&countrycodes=us";
    }

    // Add bounded search for better results
    url += "&bounded=1";

    console.log("Geocoding full address:", fullAddress);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Trickipedia-Events/1.0", // Required by Nominatim
      },
    });

    if (!response.ok) {
      console.error(
        "Geocoding API error:",
        response.status,
        response.statusText
      );
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn("No geocoding results found for address:", fullAddress);
      return null;
    }

    const result = data[0];

    // Log the result for debugging
    console.log("Geocoding result for:", fullAddress);
    console.log("Found:", result.display_name);
    console.log("Coordinates:", result.lat, result.lon);
    console.log("Importance:", result.importance); // Nominatim's confidence score

    return {
      latitude: Number.parseFloat(result.lat),
      longitude: Number.parseFloat(result.lon),
      display_name: result.display_name,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Fallback function that tries multiple address formats
export async function geocodeAddressWithFallback(
  address: string,
  city?: string,
  state?: string,
  country?: string
): Promise<GeocodeResult | null> {
  // First try with full address
  let result = await geocodeAddress(address, city, state, country);
  if (result) return result;

  // If no city provided but we have other location fields, try those combinations
  if (!city && state) {
    console.log("Retrying geocoding with state only...");
    result = await geocodeAddress(address, undefined, state, country);
    if (result) return result;
  }

  // Try just the base address as last resort
  if (city || state || country) {
    console.log("Retrying geocoding with address only as fallback...");
    result = await geocodeAddress(address);
    if (result) return result;
  }

  return null;
}

// Reverse geocoding - get address from coordinates
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Trickipedia-Events/1.0",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}
