const axios = require('axios');
const https = require('https');

const API_KEY = process.env.OWM_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';

const api = axios.create({
  httpsAgent: new https.Agent({ family: 4 }),
  timeout: 10000,
});

function windDegToDirection(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

async function getUVIndex(lat, lon) {
  try {
    const response = await api.get(`${BASE_URL}/uvi`, {
      params: { lat, lon, appid: API_KEY },
    });
    return {
      value: response.data.value,
      level: uvLevel(response.data.value),
    };
  } catch (err) {
    return null;
  }
}

async function getAirQuality(lat, lon) {
  try {
    const response = await api.get(`${BASE_URL}/air_pollution`, {
      params: { lat, lon, appid: API_KEY },
    });
    const aqi = response.data.list[0].main.aqi;
    return {
      aqi,
      level: aqiLevel(aqi),
      components: response.data.list[0].components,
    };
  } catch (err) {
    return null;
  }
}

function uvLevel(value) {
  if (value <= 2) return 'Low';
  if (value <= 5) return 'Moderate';
  if (value <= 7) return 'High';
  if (value <= 10) return 'Very High';
  return 'Extreme';
}

function aqiLevel(aqi) {
  if (aqi === 1) return 'Good';
  if (aqi === 2) return 'Fair';
  if (aqi === 3) return 'Moderate';
  if (aqi === 4) return 'Poor';
  return 'Very Poor';
}

async function getCurrentByCoords(lat, lon) {
  const response = await api.get(`${BASE_URL}/weather`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
      lang: 'en',
    },
  });

  return parseCurrentWeather(response.data);
}

function parseCurrentWeather(data) {
  return {
    city: data.name,
    lat: data.coord.lat,
    lon: data.coord.lon,
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    tempMin: data.main.temp_min,
    tempMax: data.main.temp_max,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg,
    windDirection: windDegToDirection(data.wind.deg),
    weatherId: data.weather[0].id,
    weatherMain: data.weather[0].main,
    weatherDescription: data.weather[0].description,
    clouds: data.clouds.all,
    visibility: data.visibility,
    dt: data.dt,
  };
}

async function getOneCall(lat, lon) {
  const response = await api.get(ONECALL_URL, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
      lang: 'en',
      exclude: 'minutely,hourly,alerts',
    },
  });

  const data = response.data;

  return {
    lat: data.lat,
    lon: data.lon,
    timezone: data.timezone,
    daily: data.daily.map((day) => ({
      dt: day.dt,
      temperature: day.temp.day,
      tempMin: day.temp.min,
      tempMax: day.temp.max,
      tempMorn: day.temp.morn,
      tempEve: day.temp.eve,
      tempNight: day.temp.night,
      feelsLike: day.feels_like.day,
      humidity: day.humidity,
      pressure: day.pressure,
      windSpeed: day.wind_speed,
      windDeg: day.wind_deg,
      windDirection: windDegToDirection(day.wind_deg),
      weatherId: day.weather[0].id,
      weatherMain: day.weather[0].main,
      weatherDescription: day.weather[0].description,
      clouds: day.clouds,
      pop: day.pop,
      uvi: day.uvi,
      rain: day.rain || 0,
    })),
  };
}

module.exports = { getCurrentByCoords, getOneCall, getUVIndex, getAirQuality };