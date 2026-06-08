/**
 * Author: Zhang Yuhan
 */
function recommend(temperature, humidity, windSpeed) {
  let layers = 0;
  let advice = '';
  let details = [];

  if (temperature >= 30) {
    layers = 1;
    advice = 'Wear a single layer of lightweight clothing such as a T-shirt, shorts, or summer dress.';
    details.push('Hot weather — stay hydrated and use sun protection');
  } else if (temperature >= 25) {
    layers = 1;
    advice = 'Wear a single layer of breathable clothing such as a short-sleeve shirt, light shirt, or skirt.';
    details.push('Warm weather — lightweight summer clothing is ideal');
  } else if (temperature >= 20) {
    layers = 2;
    advice = 'Wear a light jacket or long-sleeve shirt over a short-sleeve inner layer. Bring a light coat for cool mornings and evenings.';
    details.push('Comfortable temperature — layering allows easy adjustment');
  } else if (temperature >= 15) {
    layers = 2;
    advice = 'Wear a long-sleeve top with a light jacket, or a hoodie or knit sweater.';
    details.push('Spring/autumn transition temperature — watch for day-night temperature swings');
  } else if (temperature >= 10) {
    layers = 3;
    advice = 'Dress in three layers: inner layer + sweater/hoodie + coat.';
    details.push('Cool weather — stay warm');
  } else if (temperature >= 5) {
    layers = 3;
    advice = 'Wear thermal underwear + sweater + thick coat, or a light down jacket.';
    details.push('Cold weather — keep warm');
  } else if (temperature >= -5) {
    layers = 4;
    advice = 'Wear thermal underwear + thick sweater + down jacket/padded coat, with scarf and gloves.';
    details.push('Freezing weather — take full cold protection measures');
  } else {
    layers = 5;
    advice = 'Wear extra-thick thermal underwear + thick sweater + heavy down jacket, with scarf, gloves, and hat.';
    details.push('Extreme cold — minimize outdoor activity');
  }

  if (humidity > 80) {
    details.push('High humidity — the perceived temperature may feel cooler, consider adding a layer');
    if (layers < 5) {
      layers += 1;
    }
  } else if (humidity < 30) {
    details.push('Dry air — remember to moisturize your skin');
  }

  if (windSpeed > 10) {
    details.push(`Strong wind (${windSpeed}m/s) — significant wind chill effect, wear a windproof jacket`);
    if (layers < 5) {
      layers += 1;
    }
  } else if (windSpeed > 5) {
    details.push('Breezy — choose wind-resistant fabrics');
  }
  return {
    layers: Math.min(layers, 5),
    advice,
    details,
  };
}

module.exports = { recommend };