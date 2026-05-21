const axios = require('axios');
const https = require('https');
require('dotenv').config({ override: true });

const api = axios.create({
  httpsAgent: new https.Agent({ family: 4 }),
  timeout: 1000000,
});

async function test(name, fn) {
  process.stdout.write(`[${name}] testing... `);
  try {
    const result = await fn();
    console.log('OK', JSON.stringify(result).substring(0, 120));
  } catch (err) {
    console.log('FAIL');
    console.log(`  code   : ${err.code}`);
    console.log(`  message: ${err.message}`);
    if (err.response) {
      console.log(`  status : ${err.response.status}`);
      console.log(`  data   : ${JSON.stringify(err.response.data).substring(0, 200)}`);
    }
  }
}

async function main() {
  console.log('=== API Diagnostic ===\n');

  const amapKey = process.env.EXPO_PUBLIC_GAODE_API_KEY;
  const owmKey = process.env.OWM_API_KEY;
  const dsKey = process.env.DEEPSEEK_API_KEY;

  console.log(`Amap key : ${amapKey ? amapKey.substring(0, 6) + '...' : 'MISSING'}`);
  console.log(`OWM key  : ${owmKey ? owmKey.substring(0, 6) + '...' : 'MISSING'}`);
  console.log(`DS key   : ${dsKey ? dsKey.substring(0, 6) + '...' : 'MISSING'}`);
  console.log('');

  await test('Amap geocode', async () => {
    const res = await api.get('https://restapi.amap.com/v3/geocode/geo', {
      params: { key: amapKey, address: 'Beijing' },
    });
    const geo = res.data.geocodes[0];
    const [lon, lat] = geo.location.split(',').map(Number);
    return { lat, lon, address: geo.formatted_address };
  });

  await test('OWM current weather', async () => {
    const res = await api.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat: 39.9, lon: 116.4, appid: owmKey, units: 'metric' },
    });
    return { temp: res.data.main.temp, desc: res.data.weather[0].description };
  });

  await test('OWM OneCall (7-day)', async () => {
    const res = await api.get('https://api.openweathermap.org/data/2.5/onecall', {
      params: { lat: 39.9, lon: 116.4, appid: owmKey, units: 'metric', exclude: 'minutely,hourly,alerts' },
    });
    return { dailyCount: res.data.daily.length };
  });

  await test('OWM UV', async () => {
    const res = await api.get('https://api.openweathermap.org/data/2.5/uvi', {
      params: { lat: 39.9, lon: 116.4, appid: owmKey },
    });
    return { uvi: res.data.value };
  });

  await test('OWM Air Quality', async () => {
    const res = await api.get('https://api.openweathermap.org/data/2.5/air_pollution', {
      params: { lat: 39.9, lon: 116.4, appid: owmKey },
    });
    return { aqi: res.data.list[0].main.aqi };
  });

  await test('DeepSeek chat', async () => {
    const res = await api.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Say hello in 3 words' }],
      max_tokens: 20,
    }, {
      headers: { Authorization: `Bearer ${dsKey}` },
    });
    return { reply: res.data.choices[0].message.content };
  });

  console.log('\n=== Done ===');
}

main();