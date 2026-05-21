const express = require('express');
const router = express.Router();
const amap = require('../services/amap');
const openweather = require('../services/openweather');
const deepseek = require('../services/deepseek');
const layersEngine = require('../services/layersEngine');
const foodEngine = require('../services/foodEngine');
const activityEngine = require('../services/activityEngine');
const cache = require('../services/cache');
const solarTerm = require('../services/solarTerm');
const weatherCodes = require('../data/owmWeatherCodes.json');

function buildAdvicePrompt(weatherData, forecastDays, uv, air, termName) {
  const weatherName = weatherCodes[String(weatherData.weatherId)] || weatherData.weatherMain;
  const summary = (forecastDays && forecastDays.length > 0)
    ? forecastDays.map((d) =>
        `${d.date}: ${d.temperature}°C (${d.tempMin}~${d.tempMax}°C), ${d.condition}`
      ).join('\n')
    : '(7-day forecast unavailable)';

  return `You are a thoughtful lifestyle assistant. Based on the following weather information, provide recommendations.

Current weather:
- City: ${weatherData.city}
- Temperature: ${weatherData.temperature}°C (feels like ${weatherData.feelsLike}°C)
- Min/Max: ${weatherData.tempMin}°C / ${weatherData.tempMax}°C
- Humidity: ${weatherData.humidity}%
- Wind: ${weatherData.windSpeed} m/s (${weatherData.windDirection})
- Weather: ${weatherName}
- UV Index: ${uv ? `${uv.value} (${uv.level})` : 'N/A'}
- Air Quality: ${air ? `${air.level} (AQI ${air.aqi})` : 'N/A'}
- Solar Term: ${termName}

7-Day Forecast:
${summary}

Please reply in English with exactly four sections, each 1-3 sentences only:
1. Clothing Advice: what to wear considering temperature, wind, and humidity
2. Outing Advice: whether it's suitable to go out, any precautions (UV, rain, air quality)
3. Activity Advice: specific outdoor/indoor activities suited to the weather
4. Food Advice: what to eat or drink to stay comfortable in this weather`;
}

router.post('/advice', async (req, res, next) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'Please provide a city name' });
    }

    const cacheKey = `advice:${city}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    let geo;
    try {
      geo = await amap.geocode(city);
    } catch (err) {
      console.error('Amap geocode error:', err.response?.status, err.message);
      return res.status(502).json({ error: 'Failed to geocode city. Please check the city name.' });
    }

    const [weatherData, forecastData, uv, air] = await Promise.allSettled([
      openweather.getCurrentByCoords(geo.lat, geo.lon),
      openweather.getOneCall(geo.lat, geo.lon),
      openweather.getUVIndex(geo.lat, geo.lon),
      openweather.getAirQuality(geo.lat, geo.lon),
    ]);

    if (weatherData.status === 'rejected') {
      console.error('OWM current weather error:', weatherData.reason.response?.status, weatherData.reason.message);
      return res.status(502).json({ error: `Weather API error: ${weatherData.reason.response?.status || 'network'}` });
    }

    const currentWeather = weatherData.value;
    const forecastResult = forecastData.status === 'fulfilled' ? forecastData.value : null;
    const uvResult = uv.status === 'fulfilled' ? uv.value : null;
    const airResult = air.status === 'fulfilled' ? air.value : null;

    const { temperature, humidity, windSpeed, weatherId, weatherMain } = currentWeather;

    const clothing = layersEngine.recommend(temperature, humidity, windSpeed);
    const food = foodEngine.recommend(temperature, weatherId, weatherMain);
    const activity = activityEngine.recommend(temperature, weatherId, weatherMain, windSpeed);

    const termName = solarTerm.getTermName(new Date());

    const forecastDays = forecastResult
      ? forecastResult.daily.slice(0, 7).map((day) => ({
          date: new Date(day.dt * 1000).toISOString().split('T')[0],
          temperature: day.temperature,
          tempMin: day.tempMin,
          tempMax: day.tempMax,
          humidity: day.humidity,
          windSpeed: day.windSpeed,
          windDirection: day.windDirection,
          condition: weatherCodes[String(day.weatherId)] || day.weatherMain,
          pop: Math.round(day.pop * 100),
          uvi: day.uvi,
          rain: day.rain,
        }))
      : [];

    let aiAdvice = null;
    try {
      const prompt = buildAdvicePrompt(currentWeather, forecastDays, uvResult, airResult, termName);
      const messages = [
        { role: 'system', content: 'You are a thoughtful lifestyle assistant. Reply concisely in English with the four requested sections.' },
        { role: 'user', content: prompt },
      ];
      aiAdvice = await deepseek.chat(messages);
    } catch (err) {
      aiAdvice = null;
    }

    const condition = weatherCodes[String(currentWeather.weatherId)] || currentWeather.weatherMain;

    const result = {
      temperature: currentWeather.temperature,
      humidity: currentWeather.humidity,
      windSpeed: currentWeather.windSpeed,
      windDirection: currentWeather.windDirection,
      uv: uvResult ? { value: uvResult.value, level: uvResult.level } : null,
      airQuality: airResult ? { aqi: airResult.aqi, level: airResult.level } : null,
      feelsLike: currentWeather.feelsLike,
      tempMin: currentWeather.tempMin,
      tempMax: currentWeather.tempMax,
      condition,
      forecast7Days: forecastDays,
      clothingAdvice: clothing.advice,
      clothingDetails: clothing.details,
      outingAdvice: activity.outdoorSuitable
        ? 'Conditions are suitable for going out.'
        : 'Not ideal for outdoor activities. Consider staying indoors.',
      outingWarnings: activity.warnings,
      activityAdvice: activity.activities,
      foodAdvice: food.foods,
      foodDetails: food.details,
      solarTerm: termName,
      aiAdvice,
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Advice error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
