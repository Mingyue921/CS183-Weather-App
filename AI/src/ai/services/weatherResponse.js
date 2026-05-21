const weatherCodes = require('../data/owmWeatherCodes.json');

function buildWeatherResponse(weatherData, uv, air) {
  return {
    temperature: weatherData.temperature,
    feelsLike: weatherData.feelsLike,
    tempMin: weatherData.tempMin,
    tempMax: weatherData.tempMax,
    humidity: weatherData.humidity,
    pressure: weatherData.pressure,
    windSpeed: weatherData.windSpeed,
    windDirection: weatherData.windDirection,
    windDeg: weatherData.windDeg,
    clouds: weatherData.clouds,
    visibility: weatherData.visibility,
    condition: weatherCodes[String(weatherData.weatherId)] || weatherData.weatherMain,
    description: weatherData.weatherDescription,
    uv: uv || null,
    airQuality: air || null,
  };
}

module.exports = { buildWeatherResponse };