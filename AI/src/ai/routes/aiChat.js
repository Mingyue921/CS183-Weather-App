const express = require('express');
const router = express.Router();
const amap = require('../services/amap');
const openweather = require('../services/openweather');
const deepseek = require('../services/deepseek');
const fallbackEngine = require('../services/fallbackEngine');
const { buildWeatherResponse } = require('../services/weatherResponse');
const cache = require('../services/cache');
const solarTerm = require('../services/solarTerm');
const weatherCodes = require('../data/owmWeatherCodes.json');

function buildContextPrompt(weatherData, termName, uv, air, localAdvice) {
  const weatherName = weatherCodes[String(weatherData.weatherId)] || weatherData.weatherMain;
  let prompt = `[Current Weather Context — answer user questions based on this]
- City: ${weatherData.city}
- Temperature: ${weatherData.temperature}°C (feels like ${weatherData.feelsLike}°C)
- Humidity: ${weatherData.humidity}%
- Pressure: ${weatherData.pressure} hPa
- Wind: ${weatherData.windSpeed} m/s (${weatherData.windDirection})
- Weather: ${weatherName}
- Cloudiness: ${weatherData.clouds}%`;

  if (uv) {
    prompt += `\n- UV Index: ${uv.value} (${uv.level})`;
  }
  if (air) {
    prompt += `\n- Air Quality: ${air.level} (AQI ${air.aqi})`;
  }

  prompt += `\n- Current Solar Term: ${termName}

[Pre-computed Local Recommendations — you may reference or refine these]

Clothing: ${localAdvice.clothing.layers} layer(s) recommended. ${localAdvice.clothing.advice}
Details: ${localAdvice.clothing.details.join('; ')}

Food: ${localAdvice.food.recommended.join(', ')}
Details: ${localAdvice.food.details.join('; ')}

Activities: ${localAdvice.activity.recommended.join(', ')}
Outdoor suitable: ${localAdvice.activity.outdoorSuitable ? 'Yes' : 'No'}
${localAdvice.activity.warnings.length > 0 ? 'Warnings: ' + localAdvice.activity.warnings.join('; ') : ''}

Naturally incorporate the above weather, solar term, and local recommendation information into your responses.`;
  return prompt;
}

function buildNoWeatherPrompt(termName) {
  return `[Current Time Context]
- Current Solar Term: ${termName}

If the user asks about seasons, please incorporate the above solar term information in your response.`;
}

function buildFallbackReply(localAdvice, userMessage) {
  const msg = (userMessage || '').toLowerCase();

  if (msg.includes('clothes') || msg.includes('wear') || msg.includes('dress') || msg.includes('outfit')) {
    return `Based on current weather (${localAdvice.weather.temperature}°C, ${localAdvice.weather.condition}), ${localAdvice.clothing.advice}\n\nTip: ${localAdvice.clothing.details.join('; ')}`;
  }

  if (msg.includes('eat') || msg.includes('food') || msg.includes('recommend') || msg.includes('meal')) {
    return `Current weather: ${localAdvice.weather.temperature}°C, ${localAdvice.weather.condition}. Recommended foods: ${localAdvice.food.recommended.join(', ')}.\n\nTip: ${localAdvice.food.details.join('; ')}`;
  }

  if (msg.includes('play') || msg.includes('activity') || msg.includes('sport') || msg.includes('outdoor') || msg.includes('exercise')) {
    const outdoor = localAdvice.activity.outdoorSuitable ? 'Suitable for outdoor activities' : 'Indoor activities recommended';
    return `${outdoor}. Suggestions: ${localAdvice.activity.recommended.join(', ')}.\n\n${localAdvice.activity.warnings.length > 0 ? 'Warning: ' + localAdvice.activity.warnings.join('; ') : ''}`;
  }

  return `Current weather: ${localAdvice.weather.condition}, ${localAdvice.weather.temperature}°C, humidity ${localAdvice.weather.humidity}%, wind ${localAdvice.weather.windSpeed}m/s.

Clothing: ${localAdvice.clothing.advice}
Food: ${localAdvice.food.recommended.slice(0, 5).join(', ')}
Activities: ${localAdvice.activity.recommended.slice(0, 5).join(', ')}

Current Solar Term: "${localAdvice.solarTerm}"`;
}

router.post('/chat', async (req, res) => {
  try {
    const { messages, city } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Please provide a valid messages array' });
    }

    const userMessage = messages[messages.length - 1]?.content || '';
    const termName = solarTerm.getTermName(new Date());

    let weatherData = null;
    let uv = null;
    let air = null;
    let localAdvice = null;

    if (city) {
      const cacheKey = `chat:weather:${city}`;
      const cachedWeather = cache.get(cacheKey);

      if (cachedWeather) {
        weatherData = cachedWeather.data;
      } else {
        try {
          const geo = await amap.geocode(city);
          weatherData = await openweather.getCurrentByCoords(geo.lat, geo.lon);
          cache.set(cacheKey, weatherData);
        } catch (err) {
          weatherData = null;
        }
      }

      if (weatherData) {
        const [uvSettled, airSettled] = await Promise.allSettled([
          openweather.getUVIndex(weatherData.lat, weatherData.lon),
          openweather.getAirQuality(weatherData.lat, weatherData.lon),
        ]);
        uv = uvSettled.status === 'fulfilled' ? uvSettled.value : null;
        air = airSettled.status === 'fulfilled' ? airSettled.value : null;
        localAdvice = fallbackEngine.generate({
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
          weatherId: weatherData.weatherId,
          weatherMain: weatherData.weatherMain,
        });
      }
    }

    const contextPrompt = weatherData
      ? buildContextPrompt(weatherData, termName, uv, air, localAdvice)
      : buildNoWeatherPrompt(termName);

    const systemMessage = {
      role: 'system',
      content: `You are a thoughtful lifestyle assistant, skilled at providing clothing, food, and activity recommendations based on weather conditions. Please reply in English with a warm and friendly tone, like chatting with a friend.\n\n${contextPrompt}`,
    };

    const fullMessages = [systemMessage, ...messages];

    let reply;
    let source = 'ai';

    try {
      reply = await deepseek.chat(fullMessages);
    } catch (err) {
      if (localAdvice) {
        reply = buildFallbackReply(localAdvice, userMessage);
        source = 'local';
      } else {
        reply = 'Sorry, the AI service is currently unavailable. Please try again later. You can also try providing a city name to get local recommendations.';
        source = 'fallback';
      }
    }

    const response = { reply, source };

    if (weatherData) {
      response.weather = buildWeatherResponse(weatherData, uv, air);
    }

    if (localAdvice) {
      response.localAdvice = localAdvice;
    }

    res.json(response);
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
