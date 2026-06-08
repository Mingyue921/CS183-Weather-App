jest.mock('../services/amap');
jest.mock('../services/openweather');
jest.mock('../services/deepseek');
jest.mock('../services/cache');
jest.mock('../services/solarTerm');

const router = require('../routes/aiAdvice');
const amap = require('../services/amap');
const openweather = require('../services/openweather');
const deepseek = require('../services/deepseek');
const cache = require('../services/cache');
const solarTerm = require('../services/solarTerm');

const mockGeo = { lat: 39.9042, lon: 116.4074, formattedAddress: 'Beijing', city: 'Beijing' };

const mockCurrentWeather = {
  city: 'Beijing',
  lat: 39.9042,
  lon: 116.4074,
  temperature: 22.5,
  feelsLike: 21.0,
  tempMin: 19.0,
  tempMax: 25.0,
  humidity: 55,
  pressure: 1013,
  windSpeed: 3.5,
  windDeg: 135,
  windDirection: 'SE',
  weatherId: 800,
  weatherMain: 'Clear',
  weatherDescription: 'clear sky',
  clouds: 20,
  visibility: 10000,
  dt: Date.now() / 1000,
};

const mockUV = { value: 5.2, level: 'Moderate' };
const mockAir = { aqi: 2, level: 'Fair', components: { pm2_5: 12.0, pm10: 25.0 } };

/**
 * Author: Zhang Yuhan
 */
function makeMockDaily(index) {
  const baseTemp = 23 + index;
  return {
    dt: (Date.now() / 1000) + index * 86400,
    temperature: baseTemp,
    tempMin: baseTemp - 4,
    tempMax: baseTemp + 4,
    tempMorn: baseTemp - 2,
    tempEve: baseTemp + 1,
    tempNight: baseTemp - 3,
    feelsLike: baseTemp - 1,
    humidity: 50 + index * 2,
    pressure: 1013 + index,
    windSpeed: 3.0 + index * 0.5,
    windDeg: 90 + index * 30,
    windDirection: ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N'][index],
    weatherId: 800 + index,
    weatherMain: ['Clear', 'Clouds', 'Clouds', 'Rain', 'Clear', 'Clear', 'Clear'][index],
    weatherDescription: ['clear sky', 'few clouds', 'scattered clouds', 'light rain', 'clear sky', 'clear sky', 'clear sky'][index],
    clouds: index * 10,
    pop: index * 0.1,
    uvi: 5.0 + index * 0.3,
    rain: index === 3 ? 1.2 : 0,
  };
}

const mockForecast = {
  lat: 39.9042,
  lon: 116.4074,
  timezone: 'Asia/Shanghai',
  daily: [0, 1, 2, 3, 4, 5, 6].map(makeMockDaily),
};

const mockAIResponse = `1. Clothing Advice: Wear a light jacket or long-sleeve shirt today with temperatures around 22°C.

2. Outing Advice: Great day to go out! UV is moderate so sunscreen is recommended.

3. Activity Advice: Perfect for outdoor activities like jogging, cycling, or visiting a park.

4. Food Advice: Stay hydrated and enjoy light meals like salads, fresh fruits, and cold drinks.`;

beforeEach(() => {
  jest.clearAllMocks();

  amap.geocode.mockResolvedValue(mockGeo);

  openweather.getCurrentByCoords.mockResolvedValue(mockCurrentWeather);
  openweather.getOneCall.mockResolvedValue(mockForecast);
  openweather.getUVIndex.mockResolvedValue(mockUV);
  openweather.getAirQuality.mockResolvedValue(mockAir);

  deepseek.chat.mockResolvedValue(mockAIResponse);

  cache.get.mockReturnValue(null);
  cache.set.mockImplementation(() => {});

  solarTerm.getTermName.mockReturnValue('Summer Begins');
});

/**
 * Author: Zhang Yuhan
 */
function findPostHandler(routerInstance) {
  for (const layer of routerInstance.stack) {
    if (layer.route && layer.route.path === '/advice' && layer.route.methods.post) {
      return layer.route.stack[0].handle;
    }
  }
  throw new Error('POST /advice handler not found');
}

describe('Integration — POST /api/ai/advice', () => {
  test('full pipeline: city → amap geocode → owm ×4 → engines → deepseek → json', async () => {
    const handler = findPostHandler(router);

    const req = { body: { city: 'Beijing' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await handler(req, res);

    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(res.status).not.toHaveBeenCalledWith(502);
    expect(res.status).not.toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledTimes(1);

    const data = res.json.mock.calls[0][0];

    // 1. 温度 / 体感 / 最高 / 最低
    expect(data.temperature).toBe(22.5);
    expect(data.feelsLike).toBe(21.0);
    expect(data.tempMin).toBe(19.0);
    expect(data.tempMax).toBe(25.0);

    // 2. 湿度 / 风速 / 紫外线 / 空气质量
    expect(data.humidity).toBe(55);
    expect(data.windSpeed).toBe(3.5);
    expect(data.windDirection).toBe('SE');
    expect(data.uv).toEqual({ value: 5.2, level: 'Moderate' });
    expect(data.airQuality).toEqual({ aqi: 2, level: 'Fair' });

    // 3. 天气状况
    expect(data.condition).toBe('Clear');

    // 4. 7 天预报
    expect(data.forecast7Days).toHaveLength(7);
    expect(data.forecast7Days[0]).toMatchObject({
      temperature: 23,
      tempMin: 19,
      tempMax: 27,
      humidity: 50,
      condition: 'Clear',
    });
    expect(data.forecast7Days[6].temperature).toBe(29);

    // 5. 穿衣建议
    expect(typeof data.clothingAdvice).toBe('string');
    expect(data.clothingAdvice.length).toBeGreaterThan(0);
    expect(Array.isArray(data.clothingDetails)).toBe(true);

    // 6. 出行建议
    expect(typeof data.outingAdvice).toBe('string');
    expect(Array.isArray(data.outingWarnings)).toBe(true);

    // 7. 活动建议
    expect(Array.isArray(data.activityAdvice)).toBe(true);
    expect(data.activityAdvice.length).toBeGreaterThan(0);

    // 8. 饮食建议
    expect(Array.isArray(data.foodAdvice)).toBe(true);
    expect(data.foodAdvice.length).toBeGreaterThan(0);
    expect(Array.isArray(data.foodDetails)).toBe(true);

    // 9. 节气
    expect(data.solarTerm).toBe('Summer Begins');

    // 10. AI 建议
    expect(data.aiAdvice).toBe(mockAIResponse);
  });

  test('returns error when city is missing', async () => {
    const handler = findPostHandler(router);
    const req = { body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Please provide a city name' });
  });

  test('returns 502 when amap geocode fails', async () => {
    amap.geocode.mockRejectedValue(new Error('Geocoding failed'));

    const handler = findPostHandler(router);
    const req = { body: { city: 'FakeCity' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('geocode') })
    );
  });

  test('uses cache on second call', async () => {
    const cachedResponse = { cached: true, temperature: 22.5 };
    cache.get.mockReturnValue(cachedResponse);

    const handler = findPostHandler(router);
    const req = { body: { city: 'Beijing' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(cachedResponse);
    expect(amap.geocode).not.toHaveBeenCalled();
    expect(openweather.getCurrentByCoords).not.toHaveBeenCalled();
  });

  test('works without AI when deepseek fails', async () => {
    deepseek.chat.mockRejectedValue(new Error('AI down'));

    const handler = findPostHandler(router);
    const req = { body: { city: 'Beijing' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await handler(req, res);

    const data = res.json.mock.calls[0][0];
    expect(data.aiAdvice).toBeNull();
    expect(data.temperature).toBe(22.5);
    expect(data.clothingAdvice).toBeTruthy();
  });

  test('calls all 3 apis in sequence: amap → owm current + forecast + uv + aqi', async () => {
    const handler = findPostHandler(router);
    const req = { body: { city: 'Beijing' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await handler(req, res);

    expect(amap.geocode).toHaveBeenCalledWith('Beijing');
    expect(openweather.getCurrentByCoords).toHaveBeenCalledWith(39.9042, 116.4074);
    expect(openweather.getOneCall).toHaveBeenCalledWith(39.9042, 116.4074);
    expect(openweather.getUVIndex).toHaveBeenCalledWith(39.9042, 116.4074);
    expect(openweather.getAirQuality).toHaveBeenCalledWith(39.9042, 116.4074);
  });

  test('response contains all 14 required top-level fields', async () => {
    const handler = findPostHandler(router);
    const req = { body: { city: 'Beijing' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await handler(req, res);

    const data = res.json.mock.calls[0][0];
    const requiredFields = [
      'temperature', 'humidity', 'windSpeed', 'windDirection', 'uv',
      'airQuality', 'feelsLike', 'tempMin', 'tempMax', 'condition',
      'forecast7Days', 'clothingAdvice', 'clothingDetails',
      'outingAdvice', 'outingWarnings', 'activityAdvice',
      'foodAdvice', 'foodDetails', 'solarTerm', 'aiAdvice',
    ];

    for (const field of requiredFields) {
      expect(data).toHaveProperty(field);
    }
  });
});
