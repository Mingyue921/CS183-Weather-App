const TERMS = [
  { name: 'Minor Cold', month: 1, day: 5 },
  { name: 'Major Cold', month: 1, day: 20 },
  { name: 'Spring Begins', month: 2, day: 4 },
  { name: 'Rain Water', month: 2, day: 19 },
  { name: 'Insects Awaken', month: 3, day: 6 },
  { name: 'Spring Equinox', month: 3, day: 21 },
  { name: 'Clear and Bright', month: 4, day: 5 },
  { name: 'Grain Rain', month: 4, day: 20 },
  { name: 'Summer Begins', month: 5, day: 5 },
  { name: 'Grain Full', month: 5, day: 21 },
  { name: 'Grain in Ear', month: 6, day: 6 },
  { name: 'Summer Solstice', month: 6, day: 21 },
  { name: 'Minor Heat', month: 7, day: 7 },
  { name: 'Major Heat', month: 7, day: 23 },
  { name: 'Autumn Begins', month: 8, day: 7 },
  { name: 'Limit of Heat', month: 8, day: 23 },
  { name: 'White Dew', month: 9, day: 8 },
  { name: 'Autumn Equinox', month: 9, day: 23 },
  { name: 'Cold Dew', month: 10, day: 8 },
  { name: 'Frost Descent', month: 10, day: 23 },
  { name: 'Winter Begins', month: 11, day: 7 },
  { name: 'Minor Snow', month: 11, day: 22 },
  { name: 'Major Snow', month: 12, day: 7 },
  { name: 'Winter Solstice', month: 12, day: 22 },
];

function getTermName(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateValue = month * 100 + day;

  let result = TERMS[TERMS.length - 1];
  for (const term of TERMS) {
    if (dateValue >= term.month * 100 + term.day) {
      result = term;
    }
  }

  return result.name;
}

module.exports = { getTermName };