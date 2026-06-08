const express = require('express');
const path = require('path');

const router = express.Router();

const OPENWEATHER_API_KEY = process.env.WEATHER_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const WEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
const DEEPSEEK_BASE = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

const terms = require(path.join(__dirname, '..', 'data', 'solarTerms.json'));

/**
 * Author: Chen Chuqi
 */
const toInt = (mmdd = '') => {
  const [month, day] = mmdd.split('-').map(Number);
  return month * 100 + day;
};

/**
 * Author: Chen Chuqi
 */
const findSolarTerm = (date) => {
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return null;

  const current = (target.getMonth() + 1) * 100 + target.getDate();
  return terms.find((term) => {
    const start = toInt(term.startDate);
    const end = toInt(term.endDate);
    return start <= end
      ? current >= start && current <= end
      : current >= start || current <= end;
  }) || null;
};

/**
 * Author: Chen Chuqi
 */
const buildFallback = (weather, term) => {
  const temp = Number(weather.main?.temp ?? 20);
  const description = weather.weather?.[0]?.description || 'clear weather';
  const city = weather.name || 'the selected city';

  let clothing = 'Wear comfortable daily clothing and adjust layers according to the actual temperature.';
  let food = 'Keep meals balanced, drink enough water, and choose seasonal fruit and vegetables.';
  let activity = 'Light outdoor activity is suitable if there is no active weather warning.';

  if (temp < 10) {
    clothing = 'Wear a warm coat, sweater, scarf, and gloves. Keep your neck and hands protected.';
    food = 'Choose warm meals such as soup, porridge, stews, or hot drinks.';
    activity = 'Indoor exercise, stretching, or short walks are safer in cold weather.';
  } else if (temp < 20) {
    clothing = 'Wear a long-sleeve top with a light jacket. Add a layer for early morning and evening.';
    food = 'Warm dishes, grains, and seasonal vegetables are good choices.';
    activity = 'Walking, cycling, or light jogging are suitable if the wind is not strong.';
  } else if (temp < 30) {
    clothing = 'Wear breathable clothes such as a short-sleeve shirt or light long-sleeve layer.';
    food = 'Choose lighter meals, fruit, vegetables, and enough water.';
    activity = 'Outdoor walks and moderate exercise are suitable. Remember sun protection.';
  } else {
    clothing = 'Wear light, breathable clothes and use sun protection.';
    food = 'Choose refreshing foods and avoid heavy meals during the hottest hours.';
    activity = 'Avoid long outdoor activity at noon. Prefer indoor exercise or evening walks.';
  }

  return {
    source: 'local fallback',
    weather: {
      city,
      temp: `${Math.round(temp)} C`,
      description,
      humidity: weather.main?.humidity != null ? `${weather.main.humidity}%` : '--',
    },
    solarTerm: term ? {
      name: term.name,
      startDate: term.startDate,
      endDate: term.endDate,
    } : null,
    suggestions: {
      clothing,
      food: term ? `${food} Consider seasonal solar-term food if available.` : food,
      activity,
    },
  };
};

/**
 * Author: Chen Chuqi
 */
const extractJsonObject = (text = '') => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
};

// GET /api/ai-suggestions?city=Beijing&date=2026-04-20
/**
 * Author: Chen Chuqi
 */
router.get('/', async (req, res) => {
  const { city, date } = req.query;
  if (!city) return res.status(400).json({ error: 'city is required' });
  if (!OPENWEATHER_API_KEY) return res.status(500).json({ error: 'WEATHER_API_KEY is missing' });

  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const weatherRes = await fetch(
      `${WEATHER_BASE}/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=en`
    );
    const weather = await weatherRes.json().catch(() => ({}));
    if (!weatherRes.ok) {
      return res.status(weatherRes.status).json({
        error: weather.message || `Failed to fetch weather: ${weatherRes.status}`,
      });
    }

    const term = findSolarTerm(targetDate);

    if (DEEPSEEK_API_KEY) {
      try {
        const prompt = [
          'You are a weather-based lifestyle assistant.',
          'Return only valid JSON with these fields: clothing, food, activity.',
          `Date: ${targetDate}`,
          `City: ${weather.name}`,
          `Weather: ${weather.weather?.[0]?.description || 'unknown'}`,
          `Temperature: ${weather.main?.temp} C`,
          `Humidity: ${weather.main?.humidity}%`,
          term ? `Current solar term: ${term.name}` : 'Current solar term: unknown',
        ].join('\n');

        const aiRes = await fetch(`${DEEPSEEK_BASE}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: 'Return concise English lifestyle suggestions as valid JSON only.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          const suggestions = extractJsonObject(content);
          if (suggestions) {
            return res.json({
              source: 'DeepSeek AI',
              weather: {
                city: weather.name,
                temp: `${weather.main.temp} C`,
                description: weather.weather?.[0]?.description || '',
                humidity: `${weather.main.humidity}%`,
              },
              solarTerm: term ? {
                name: term.name,
                startDate: term.startDate,
                endDate: term.endDate,
              } : null,
              suggestions,
            });
          }
        }
      } catch (aiErr) {
        console.error('DeepSeek suggestion request failed:', aiErr.message);
      }
    }

    return res.json(buildFallback(weather, term));
  } catch (err) {
    console.error('AI suggestions endpoint failed:', err.message);
    return res.status(500).json({ error: 'Failed to get AI suggestions. Please try again later.' });
  }
});

module.exports = router;
