// src/geocoding/photon.ts
// Primary geocoder using Photon (photon.komoot.io).
// Free, no API key, CORS-enabled. Built on OpenStreetMap data.
// Returns up to 3 results when available -- caller handles disambiguation.
// Do NOT use Nominatim: CORS fails on 403/429 responses (see PITFALLS.md).

export interface PhotonFeature {
  city: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export async function geocodeCity(
  city: string,
  country: string,
): Promise<PhotonFeature[]> {
  const query = encodeURIComponent(`${city} ${country}`);
  const url = `https://photon.komoot.io/api/?q=${query}&limit=3&layer=city`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Photon geocoding failed: HTTP ${res.status}`);
  }

  const data = await res.json() as {
    features: Array<{
      geometry: { coordinates: [number, number] };
      properties: { name?: string; country?: string; state?: string };
    }>;
  };

  if (!data.features?.length) {
    return [];
  }

  return data.features.map((f) => {
    const [lon, lat] = f.geometry.coordinates; // GeoJSON: lon first, lat second
    return {
      city: f.properties.name ?? city,
      country: f.properties.country ?? country,
      state: f.properties.state,
      lat,
      lon,
    };
  });
}
