const foodEngine = require('../services/foodEngine');

describe('foodEngine', () => {
  test('hot weather should recommend cooling foods', () => {
    const result = foodEngine.recommend(33, 800, 'Clear');
    expect(result.foods).toContain('Mung bean soup');
    expect(result.foods).toContain('Watermelon');
    expect(result.details.some((d) => d.includes('cooling'))).toBe(true);
  });

  test('cold weather should recommend warming foods', () => {
    const result = foodEngine.recommend(-3, 800, 'Clear');
    expect(result.foods).toContain('Spicy hot pot');
    expect(result.foods).toContain('Lamb paomo');
    expect(result.details.some((d) => d.includes('keep warm') || d.includes('high-calorie'))).toBe(true);
  });

  test('rainy day should recommend hot soup and ginger tea', () => {
    const result = foodEngine.recommend(20, 502, 'Rain');
    expect(result.foods).toContain('Hot noodle soup');
    expect(result.foods).toContain('Ginger tea');
    expect(result.details.some((d) => d.includes('warm your stomach'))).toBe(true);
  });
});