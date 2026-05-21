const axios = require('axios');
const https = require('https');

const API_KEY = process.env.EXPO_PUBLIC_GAODE_API_KEY || '';
const BASE_URL = 'https://restapi.amap.com/v3/geocode/geo';

const api = axios.create({
  httpsAgent: new https.Agent({ family: 4 }),
  timeout: 10000,
});

async function geocode(address) {
  const response = await api.get(BASE_URL, {
    params: {
      key: API_KEY,
      address,
    },
  });

  const data = response.data;

  if (data.status !== '1' || !data.geocodes || data.geocodes.length === 0) {
    throw new Error(`Geocoding failed for address: ${address}`);
  }

  const geo = data.geocodes[0];
  const [lon, lat] = geo.location.split(',').map(Number);

  return {
    lat,
    lon,
    formattedAddress: geo.formatted_address,
    city: geo.city || address,
    district: geo.district || '',
    province: geo.province || '',
  };
}

module.exports = { geocode };
