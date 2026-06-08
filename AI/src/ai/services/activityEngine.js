/**
 * Author: Zhang Yuhan
 */
function recommend(temperature, weatherId, weatherMain, windSpeed) {
  const activities = [];
  const warnings = [];

  const isDangerousWeather =
    (weatherId >= 200&&weatherId<300)||(weatherId >= 500&&weatherId<600 && weatherId !== 500 && weatherId !== 501) ||weatherId === 781 ||weatherId === 771 ||weatherId === 731;

  if (isDangerousWeather) {
    warnings.push('Poor weather conditions — reduce outdoor activities, prioritize indoor activities');
    activities.push('Read at home', 'Indoor fitness', 'Watch movies', 'Cook a meal', 'Organize your room');
    return {
       activities, warnings, outdoorSuitable: false 
      };
  }

  if (windSpeed > 15) {
    warnings.push(`Strong wind (${windSpeed}m/s) — not suitable for outdoor or high-altitude activities`);
    activities.push('Indoor yoga', 'Gym workout', 'Swim at indoor pool', 'Go shopping', 'Visit a museum');
    return {
       activities, warnings, outdoorSuitable: false
      };
  }

  if (temperature >= 35) {
    warnings.push('Heat warning — avoid prolonged outdoor activity and stay hydrated');
    activities.push('Swimming', 'Indoor ice skating', 'Go shopping', 'Water park', 'Read at the library');
  } 
  else if (temperature >= 30) {
    activities.push('Swimming', 'Water sports', 'Morning jog', 'Cycling', 'Park walk');
    warnings.push('Hot weather — outdoor activities recommended before noon or after 4 PM');
  } 
  else if (temperature >= 25) {
    activities.push('Hiking', 'Cycling', 'Picnic', 'Outdoor yoga', 'Running');
  } 
  else if (temperature >= 20) {
    activities.push('Mountain hiking', 'Cycling', 'Running', 'Outdoor photography', 'Park walk', 'Kite flying');
  } 
  else if (temperature >= 15) {
    activities.push('Mountain hiking', 'Cycling', 'Jogging', 'Outdoor photography', 'Park stroll');
  } 
  else if (temperature >= 10) {
    activities.push('Brisk walking', 'Jogging', 'Cycling', 'Outdoor photography', 'Visit old town');
    warnings.push('Cool weather — dress warmly for outdoor activities');
  } 
  else if (temperature >= 5) {
    activities.push('Brisk walking', 'Jogging', 'Indoor sports', 'Hot spring bath', 'Visit a museum');
    warnings.push('Cold weather — bundle up for outdoor activities');
  } 
  else if (temperature >= -5) {
    activities.push('Skiing', 'Ice skating', 'Hot spring bath', 'Indoor sports', 'Visit a museum');
    warnings.push('Freezing weather — take full cold protection for outdoor activity');
  } 
  else {
    activities.push('Indoor sports', 'Hot spring bath', 'Visit a museum', 'Watch movies', 'Home workout');
    warnings.push('Extreme cold — avoid prolonged outdoor activity');
  }

  if (weatherId >= 300 && weatherId < 400) {
    activities.push('Walk in the rain');
    warnings.push('Light rain — remember to bring an umbrella');
  } 
  else if (weatherId >= 500 && weatherId < 510) {
    activities.push('Board games', 'Coffee shop visit');
    warnings.push('Rainy day — indoor activities recommended');
  } 
  else if (weatherId >= 600 && weatherId < 700) {
    activities.push('Build a snowman', 'Snowball fight', 'Snow photography');
    warnings.push('Snowy day — watch for slippery roads');
  }

  if (weatherMain === 'Clear') {
    activities.push('Stargazing', 'Sunset viewing');
  }

  return {
    activities: [...new Set(activities)],
    warnings,
    outdoorSuitable: true,
  };
}

module.exports = { recommend };