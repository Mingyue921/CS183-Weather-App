const express = require('express');
const router = express.Router();

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const OPENWEATHER_TIMEOUT_MS = 120000;

async function fetchOpenWeather(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENWEATHER_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// GET /api/weather/current?city=Beijing
router.get('/current', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'city is required' });

  try {
    const response = await fetchOpenWeather(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=en`
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET /api/weather/forecast?city=Beijing
router.get('/forecast', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'city is required' });

  try {
    const response = await fetchOpenWeather(
      `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=en`
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    // 只返回每天中午12:00的数据（前端固定用这个逻辑）
    const daily = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    res.json({ ...data, list: daily });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// GET /api/weather/daily?lat=26.08&lon=119.30
router.get('/daily', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });
  if (!API_KEY) return res.status(500).json({ error: 'WEATHER_API_KEY is missing' });

  try {
    const response = await fetchOpenWeather(
      `${ONECALL_URL}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${API_KEY}&units=metric&lang=en&exclude=minutely,hourly,alerts`
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    res.json({
      current: data.current,
      daily: (data.daily || []).slice(0, 8),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch daily weather data' });
  }
});

// GET /api/weather/alerts?lat=26.08&lon=119.30
router.get('/alerts', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });

  if (!API_KEY) {
    return res.json({
      alerts: [],
      warning: 'Weather alerts are unavailable because WEATHER_API_KEY is missing on the backend.',
      unavailable: true,
    });
  }

  try {
    const response = await fetchOpenWeather(
      `${ONECALL_URL}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${API_KEY}&units=metric&lang=en&exclude=current,minutely,hourly,daily`
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    res.json({
      alerts: (data.alerts || []).map((alert, index) => ({
        id: `${alert.sender_name || 'sender'}-${alert.start || index}-${alert.event || 'alert'}`,
        sender: alert.sender_name || 'Meteorological Department',
        event: alert.event || 'Weather Alert',
        start: alert.start,
        end: alert.end,
        description: alert.description || '',
        tags: alert.tags || [],
      })),
    });
  } catch (err) {
    console.warn('Failed to fetch weather alerts:', err.message);
    res.json({
      alerts: [],
      warning: 'Weather alert service is temporarily unavailable. This means the alert request failed, not that there are no alerts.',
      unavailable: true,
    });
  }
});

module.exports = router;
