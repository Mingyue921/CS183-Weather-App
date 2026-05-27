const express = require('express');
const path = require('path');
const router = express.Router();

const API_KEY = process.env.WEATHER_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const WEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
const DEEPSEEK_BASE = 'https://api.deepseek.com/v1/chat/completions';

const terms = require(path.join(__dirname, '..', 'data', 'solarTerms.json'));

const toInt = (mmdd) => {
  const [m, d] = mmdd.split('-').map(Number);
  return m * 100 + d;
};

const findSolarTerm = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const cur = (d.getMonth() + 1) * 100 + d.getDate();

  for (const term of terms) {
    const start = toInt(term.startDate);
    const end = toInt(term.endDate);
    if (start <= end) {
      if (cur >= start && cur <= end) return term;
    } else {
      if (cur >= start || cur <= end) return term;
    }
  }
  return null;
};

// 无 AI 时的规则兜底建议
const buildFallback = (weather, term) => {
  const temp = weather.main?.temp ?? 20;
  const desc = weather.weather?.[0]?.description ?? '晴朗';

  let clothing, food, activity;

  if (temp < 10) {
    clothing = '羽绒服、围巾、手套，注意保暖';
    food = term ? `时令推荐：${term.diet}，搭配热汤暖身` : '火锅、热汤、姜茶';
    activity = '室内运动、温泉、赏雪';
  } else if (temp < 20) {
    clothing = '薄外套、毛衣，早晚添衣';
    food = term ? `时令推荐：${term.diet}，温补为宜` : '炖菜、热粥、坚果';
    activity = term ? `${term.culture}` : '散步、骑行、登山';
  } else if (temp < 30) {
    clothing = '短袖、薄长裤，注意防晒';
    food = term ? `时令推荐：${term.diet}，清爽为主` : '凉拌菜、水果、绿茶';
    activity = term ? `${term.culture}` : '郊游、野餐、骑行';
  } else {
    clothing = '轻薄透气衣物，做好防晒';
    food = term ? `时令推荐：${term.diet}，清热解暑` : '西瓜、绿豆汤、凉面';
    activity = '游泳、室内避暑、夜跑';
  }

  return {
    source: '本地规则（DeepSeek 未配置或调用失败）',
    weather: { temp: `${temp}°C`, description: desc },
    solarTerm: term ? { name: term.name, poem: term.poetry } : null,
    suggestions: { clothing, food, activity },
  };
};

// GET /api/ai-suggestions?city=Beijing&date=2026-04-20
router.get('/', async (req, res) => {
  const { city, date } = req.query;
  if (!city) return res.status(400).json({ error: 'city is required' });

  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    // 1. 获取天气
    const weatherRes = await fetch(
      `${WEATHER_BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=zh_cn`
    );
    if (!weatherRes.ok) {
      return res.status(weatherRes.status).json({ error: `获取天气失败: ${weatherRes.statusText}` });
    }
    const weather = await weatherRes.json();

    // 2. 匹配节气
    const term = findSolarTerm(targetDate);

    // 3. 有 DeepSeek Key 则调用 AI
    if (DEEPSEEK_API_KEY) {
      try {
        const prompt = `你是一个生活建议助手。根据以下信息，用 JSON 格式给出建议（clothing 穿搭、food 饮食、activity 活动）：
- 日期：${targetDate}
- 城市：${weather.name}
- 天气：${weather.weather[0].description}，温度 ${weather.main.temp}°C，湿度 ${weather.main.humidity}%
${term ? `- 当前节气：${term.name}，习俗：${term.culture}，时令饮食：${term.diet}` : ''}

请直接返回 JSON，不要有其他文字：
{"clothing": "...", "food": "...", "activity": "..."}`;

        const aiRes = await fetch(DEEPSEEK_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: '你是生活建议助手，只返回JSON。' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          // 提取 JSON
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const suggestions = JSON.parse(jsonMatch[0]);
            return res.json({
              source: 'DeepSeek AI',
              weather: {
                city: weather.name,
                temp: `${weather.main.temp}°C`,
                description: weather.weather[0].description,
                humidity: `${weather.main.humidity}%`,
              },
              solarTerm: term ? { name: term.name, poem: term.poetry, culture: term.culture } : null,
              suggestions,
            });
          }
        }
      } catch (aiErr) {
        console.error('DeepSeek 调用失败，使用本地规则兜底:', aiErr.message);
      }
    }

    // 4. 兜底
    res.json(buildFallback(weather, term));
  } catch (err) {
    console.error('AI建议接口错误:', err.message);
    res.status(500).json({ error: '获取建议失败，请稍后再试' });
  }
});

module.exports = router;
