const express = require('express');
const router = express.Router();

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// GET /api/weather/current?city=Beijing
router.get('/current', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'city is required' });

  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=zh_cn`
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
    const response = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=zh_cn`
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

module.exports = router;
