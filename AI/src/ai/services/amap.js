const axios = require('axios');
const https = require('https');
const cityCoords = require('../data/cityCoords.json');

const API_KEY = process.env.EXPO_PUBLIC_GAODE_API_KEY || '';
const BASE_URL = 'https://restapi.amap.com/v3/geocode/geo';

const api = axios.create({
  httpsAgent: new https.Agent({ family: 4 }),
  timeout: 10000,
});
/**
 * Author: Zhang Yuhan
 */

const geoCache = new Map();

for (const [name, coords] of Object.entries(cityCoords)) {
  geoCache.set(name.toLowerCase(), {
    lat: coords.lat,
    lon: coords.lon,
    formattedAddress: name,
    city: name,
    district: '',
    province: '',
    source: 'local',
  });
}

async function geocode(address) {
  const key = (address || '').toLowerCase().trim();
  if (!key) {
    throw new Error('Address is required');
  }

  
  const cachedGeo = geoCache.get(key);
  if (cachedGeo) {
    return cachedGeo;
  }

  
  try {
    const response = await api.get(BASE_URL, {
      params: { key: API_KEY, address },
    });

    const data = response.data;

    if (data.status !== '1' || !data.geocodes || data.geocodes.length === 0) {
      throw new Error(`Geocoding failed for address: ${address}`);
    }

    const geo = data.geocodes[0];
    const [lon, lat] = geo.location.split(',').map(Number);

    const result = {
      lat,
      lon,
      formattedAddress: geo.formatted_address || address,
      city: geo.city || address,
      district: geo.district || '',
      province: geo.province || '',
      source: 'amap',
    };

    
    geoCache.set(key, result);

    return result;
  } catch (err) {
    
    const fallback = geoCache.get(key);
    if (fallback) {
      console.warn(`Amap geocode failed for "${address}", using cached coordinates`);
      return fallback;
    }

    throw err;
  }
}

module.exports = { geocode };
