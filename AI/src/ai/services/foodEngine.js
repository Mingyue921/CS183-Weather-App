function recommend(temperature, weatherId, weatherMain) {
  const foods = [];
  const details = [];

  if (temperature >= 30) {
    foods.push('Cold noodles', 'Mung bean soup', 'Watermelon', 'Ice jelly', 'Cold rice noodles');
    details.push('Hot weather — choose cooling and refreshing foods');
  } 
  else if (temperature >= 25) {
    foods.push('Salad', 'Fruit platter', 'Cold tossed dishes', 'Sour plum drink', 'Coconut water');
    details.push('Warm weather — fresh and appetizing foods are ideal');
  } 
  else if (temperature >= 20) {
    foods.push('Steamed fish', 'Vegetable soup', 'Poached chicken', 'Seasonal vegetables', 'Jasmine tea');
    details.push('Pleasant temperature — light and mild meals are best');
  }
   else if (temperature >= 15) {
    foods.push('Stir-fried pork', 'Tomato egg soup', 'Sautéed seasonal greens', 'Steamed rice', 'Chrysanthemum tea');
    details.push('Comfortable temperature — regular meals are fine');
  } 
  else if (temperature >= 10) {
    foods.push('Braised pork', 'Chicken soup', 'Stew', 'Hot noodle soup', 'Ginger tea');
    details.push('Getting cooler — warm foods are recommended');
  } 
  else if (temperature >= 5) {
    foods.push('Hot pot', 'Lamb soup', 'Braised beef', 'Hot porridge', 'Red date tea');
    details.push('Cold weather — warm, body-heating foods are best');
  } 
  else if (temperature >= -5) {
    foods.push('Spicy hot pot', 'Lamb paomo', 'Braised beef brisket', 'Hot chocolate', 'Ginger soup');
    details.push('Freezing weather — high-calorie foods needed to keep warm');
  } 
  else {
    foods.push('Instant-boiled lamb', 'Braised pork ribs', 'Hot noodle soup', 'Eight-treasure porridge', 'Brown sugar ginger tea');
    details.push('Extreme cold — eat high-calorie warm foods');
  }

  if (weatherId >= 200 && weatherId < 300) {
    foods.push('Ginger soup');
    details.push('Thunderstorm — drink ginger soup to ward off chills');
  }
  else if (weatherId >= 300 && weatherId < 400) {
    foods.push('Hot tea');
    details.push('Drizzle — a cup of hot tea to warm up');
  } 
  else if (weatherId >= 500 && weatherId < 600) {
    foods.push('Hot noodle soup', 'Ginger tea');
    details.push('Rainy day — enjoy hot soup and meals to warm your stomach');
  } 
  else if (weatherId >= 600 && weatherId < 700) {
    foods.push('Hot pot', 'Hot chocolate');
    details.push('Snowy day — hot pot is the perfect choice');
  }

  if(weatherMain === 'Clear') {
    details.push('Sunny day — great for an outdoor picnic');
  }

  return {
    foods: [...new Set(foods)],
    details,
  };
}

module.exports = { recommend };