const express = require('express');
const router = express.Router();

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';

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

// GET /api/weather/alerts?lat=26.08&lon=119.30
router.get('/alerts', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat 和 lon 不能为空' });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(
      `${ONECALL_URL}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${API_KEY}&units=metric&lang=zh_cn`,
      { signal: controller.signal }
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    res.json({
      alerts: (data.alerts || []).map((alert, index) => ({
        id: `${alert.sender_name || 'sender'}-${alert.start || index}-${alert.event || 'alert'}`,
        sender: alert.sender_name || '气象部门',
        event: alert.event || '天气预警',
        start: alert.start,
        end: alert.end,
        description: alert.description || '',
        tags: alert.tags || [],
      })),
    });
  } catch (err) {
    console.warn('获取天气预警失败:', err.message);
    res.json({
      alerts: [],
      warning: '天气预警服务暂时不可用',
    });
  } finally {
    clearTimeout(timeout);
  }
});

module.exports = router;
