const express = require('express');
const { appendAiResponse } = require('../localAiStore');

const router = express.Router();
const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_BASE_URL || 'http://localhost:3001';

const adviceTypeToField = {
  travel: 'outingAdvice',
  clothing: 'clothingAdvice',
  activity: 'activityAdvice',
  diet: 'foodAdvice',
};

const adviceTitles = {
  travel: 'Travel Advice',
  clothing: 'Clothing Advice',
  activity: 'Activity Advice',
  diet: 'Food Advice',
};

/**
 * Author: Chen Chuqi
 */
function normalizeCityName(city = '') {
  const value = String(city || '').trim();
  if (!value) return '';
  if (value.endsWith('市') || value.endsWith('区') || value.endsWith('县')) return value;
  return `${value}市`;
}

const fallbackMap = {
  travel: ({ city, weather }) => {
    const weatherText = weather?.description || 'unknown weather conditions';
    return `In ${city || 'the current city'}, the weather is ${weatherText}. Check traffic before leaving, carry an umbrella if needed, and keep an eye on weather alerts.`;
  },
  clothing: ({ weather }) => {
    const temp = Number(weather?.temp);
    if (!Number.isFinite(temp)) return 'Choose clothing based on the feels-like temperature. A light jacket is useful for early morning or evening outings.';
    if (temp >= 28) return `It is about ${Math.round(temp)}°. Wear short sleeves or light breathable clothes, and remember sun protection and hydration.`;
    if (temp >= 20) return `It is about ${Math.round(temp)}°. A long-sleeve shirt or light jacket should be comfortable, especially if mornings and evenings are cooler.`;
    if (temp >= 12) return `It is about ${Math.round(temp)}°. Wear a hoodie, knit top, or light jacket, and keep your neck warm if it feels chilly.`;
    return `It is about ${Math.round(temp)}°. Wear a warm coat, sweater, or down jacket, and protect your head, neck, and hands.`;
  },
  activity: ({ weather }) => {
    const desc = weather?.description || '';
    if (desc.toLowerCase().includes('rain') || desc.includes('雨')) {
      return 'Rain is possible, so indoor activities such as yoga, stretching, or strength training are safer. If you go outside, watch for slippery roads.';
    }
    return 'Good choices include walking, light jogging, or indoor stretching. Warm up before exercising and hydrate afterward.';
  },
  diet: ({ weather }) => `For ${weather?.description || 'today\'s weather'}, keep meals light and balanced. Drink enough water, choose seasonal fruit and vegetables, and consider barley or yam when the weather feels humid.`,
};

/**
 * Author: Chen Chuqi
 */
function normalizeList(value) {
  if (Array.isArray(value)) return value.join(', ');
  return value || '';
}

/**
 * Author: Chen Chuqi
 */
function pickAdvice(raw, type) {
  const field = adviceTypeToField[type];
  if (!field) return '';
  if (type === 'activity') return normalizeList(raw.activityAdvice);
  if (type === 'diet') return normalizeList(raw.foodAdvice);
  return normalizeList(raw[field]);
}

/**
 * Author: Chen Chuqi
 */
async function callAiService(path, body) {
  const response = await fetch(`${AI_SERVICE_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `AI service failed: ${response.status}`);
  }
  return data;
}

/**
 * Author: Chen Chuqi
 */
router.post('/chat', async (req, res) => {
  const { message = '', city, messages } = req.body;
  const aiMessages = Array.isArray(messages)
    ? messages
    : [{ role: 'user', content: message }];

  try {
    const normalizedCity = normalizeCityName(city);
    const raw = await callAiService('/api/ai/chat', { city: normalizedCity || city, messages: aiMessages });
    await appendAiResponse({ kind: 'chat', request: { city: normalizedCity || city, messages: aiMessages }, response: raw });
    return res.json({
      reply: raw.reply,
      source: raw.source || 'ai-service',
      raw,
    });
  } catch (err) {
    const fallback = 'The AI service is temporarily unavailable. Please try again later, or use the travel, clothing, activity, and food advice sections first.';
    return res.json({ reply: fallback, source: 'fallback', error: err.message });
  }
});

/**
 * Author: Chen Chuqi
 */
router.post('/advice', async (req, res) => {
  const { type, city, weather } = req.body;
  if (!adviceTypeToField[type]) return res.status(400).json({ error: 'Unknown advice type' });

  try {
    const normalizedCity = normalizeCityName(city);
    const raw = await callAiService('/api/ai/advice', { city: normalizedCity || city });
    await appendAiResponse({ kind: 'advice', request: { type, city: normalizedCity || city }, response: raw });

    const reply = pickAdvice(raw, type) || raw.aiAdvice || fallbackMap[type]({ city, weather });
    return res.json({
      title: adviceTitles[type],
      reply,
      raw,
    });
  } catch (err) {
    return res.json({
      title: adviceTitles[type],
      reply: fallbackMap[type]({ city, weather }),
      source: 'fallback',
      error: err.message,
    });
  }
});

module.exports = router;
