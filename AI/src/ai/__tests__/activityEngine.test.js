const activityEngine = require('../services/activityEngine');
describe('activityEngine', () => {
  test('thunderstorm should mark outdoor as not suitable', () => {
    const result = activityEngine.recommend(25, 211, 'Thunderstorm', 5);
    expect(result.outdoorSuitable).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.activities).toContain('Read at home');
  });

  test('pleasant weather should recommend outdoor activities', () => {
    const result = activityEngine.recommend(22, 800, 'Clear', 3);
    expect(result.outdoorSuitable).toBe(true);
    expect(result.activities).toContain('Mountain hiking');
    expect(result.activities).toContain('Cycling');
  });

  test('strong wind should mark outdoor as not suitable', () => {
    const result = activityEngine.recommend(22, 800, 'Clear', 18);
    expect(result.outdoorSuitable).toBe(false);
    expect(result.warnings.some((w) => w.includes('wind'))).toBe(true);
  });
});