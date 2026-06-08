const layersEngine = require('./layersEngine');
const foodEngine = require('./foodEngine');
const activityEngine = require('./activityEngine');
const solarTerm = require('./solarTerm');
const weatherCodes = require('../data/owmWeatherCodes.json');

/**
 * Author: Zhang Yuhan
 */
function generate(weatherData) {
  const { temperature, humidity, windSpeed, weatherId, weatherMain } = weatherData;

  const layers = layersEngine.recommend(temperature, humidity, windSpeed);
  const food = foodEngine.recommend(temperature, weatherId, weatherMain);
  const activity = activityEngine.recommend(temperature, weatherId, weatherMain, windSpeed);

  const termName = solarTerm.getTermName(new Date());
  const weatherName = weatherCodes[String(weatherId)] || weatherMain;

  return {
    source: 'local',
    weather: {
      temperature,
      humidity,
      windSpeed,
      condition: weatherName,
    },
    clothing: {
      layers: layers.layers,
      advice: layers.advice,
      details: layers.details,
    },
    food: {
      recommended: food.foods,
      details: food.details,
    },
    activity: {
      recommended: activity.activities,
      warnings: activity.warnings,
      outdoorSuitable: activity.outdoorSuitable,
    },
    solarTerm: termName,
  };
}

module.exports = { generate };