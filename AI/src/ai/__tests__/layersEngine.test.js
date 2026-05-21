const layersEngine = require('../services/layersEngine');

describe('layersEngine', () => {
  describe('temperature-based layers', () => {
    test('temperature >= 30 should recommend 1 layer', () => {
      const result = layersEngine.recommend(32, 50, 3);
      expect(result.layers).toBe(1);
      expect(result.advice).toContain('single layer');
    });

    test('temperature 25-29 should recommend 1 layer', () => {
      const result = layersEngine.recommend(27, 50, 3);
      expect(result.layers).toBe(1);
      expect(result.advice).toContain('single layer');
    });

    test('temperature 20-24 should recommend 2 layers', () => {
      const result = layersEngine.recommend(22, 50, 3);
      expect(result.layers).toBe(2);
    });

    test('temperature 15-19 should recommend 2 layers', () => {
      const result = layersEngine.recommend(17, 50, 3);
      expect(result.layers).toBe(2);
    });

    test('temperature 10-14 should recommend 3 layers', () => {
      const result = layersEngine.recommend(12, 50, 3);
      expect(result.layers).toBe(3);
    });

    test('temperature 5-9 should recommend 3 layers', () => {
      const result = layersEngine.recommend(7, 50, 3);
      expect(result.layers).toBe(3);
    });

    test('temperature -5-4 should recommend 4 layers', () => {
      const result = layersEngine.recommend(0, 50, 3);
      expect(result.layers).toBe(4);
    });

    test('temperature < -5 should recommend 5 layers', () => {
      const result = layersEngine.recommend(-10, 50, 3);
      expect(result.layers).toBe(5);
    });
  });

  describe('humidity modifier', () => {
    test('humidity > 80% should add 1 layer', () => {
      const result = layersEngine.recommend(22, 85, 3);
      expect(result.layers).toBe(3);
      expect(result.details.some((d) => d.includes('humidity'))).toBe(true);
    });

    test('humidity < 30% should have dry air tip without adding layers', () => {
      const result = layersEngine.recommend(22, 20, 3);
      expect(result.details.some((d) => d.toLowerCase().includes('dry'))).toBe(true);
    });
  });

  describe('wind modifier', () => {
    test('wind > 10 m/s should add 1 layer with windproof tip', () => {
      const result = layersEngine.recommend(22, 50, 12);
      expect(result.layers).toBe(3);
      expect(result.details.some((d) => d.includes('windproof'))).toBe(true);
    });

    test('wind 5-10 m/s should have breeze tip', () => {
      const result = layersEngine.recommend(22, 50, 7);
      expect(result.details.some((d) => d.includes('wind-resistant'))).toBe(true);
    });
  });
});
