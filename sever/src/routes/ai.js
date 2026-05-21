const express = require('express');
const router = express.Router();

const suggestionMap = {
  travel: {
    title: '出行建议',
    keywords: ['出行', '交通', '通勤', '旅游'],
    build: ({ city, weather }) => {
      const desc = weather?.description || '当前天气';
      const wind = weather?.windSpeed ?? '--';
      return `${city || '当前城市'}目前${desc}，风速约 ${wind}m/s。建议出门前查看实时路况，随身带伞；若有降雨或预警，优先选择公共交通并预留更多时间。`;
    },
  },
  clothing: {
    title: '穿衣建议',
    keywords: ['穿衣', '穿什么', '衣服', '冷', '热'],
    build: ({ weather }) => {
      const temp = Number(weather?.temp);
      if (Number.isFinite(temp)) {
        if (temp >= 28) return `当前约 ${Math.round(temp)}°，建议短袖、轻薄透气衣物，注意防晒和补水。`;
        if (temp >= 20) return `当前约 ${Math.round(temp)}°，建议薄外套或长袖，早晚温差大时可加一件轻便外套。`;
        if (temp >= 12) return `当前约 ${Math.round(temp)}°，建议卫衣、针织衫或薄夹克，体感偏凉时注意护颈。`;
        return `当前约 ${Math.round(temp)}°，建议厚外套、毛衣或羽绒服，注意头颈和手部保暖。`;
      }
      return '建议根据体感温度选择衣物，早晚外出带一件外套更稳妥。';
    },
  },
  activity: {
    title: '活动建议',
    keywords: ['活动', '运动', '锻炼', '跑步'],
    build: ({ weather }) => {
      const desc = weather?.description || '';
      if (desc.includes('雨')) return '当前有降雨可能，建议选择室内运动，如瑜伽、拉伸、力量训练；户外运动需注意防滑。';
      if (desc.includes('雪')) return '当前雪天或低温环境，建议减少高强度户外运动，注意防寒防滑。';
      return '适合进行中低强度户外活动，如散步、慢跑、骑行。运动前热身，结束后及时补水。';
    },
  },
  diet: {
    title: '饮食建议',
    keywords: ['饮食', '吃', '食物', '养生'],
    build: ({ weather, solarTerm }) => {
      const desc = weather?.description || '当前天气';
      const termText = solarTerm?.name ? `现在临近${solarTerm.name}，` : '';
      return `${termText}${desc}时饮食宜清淡均衡。多补充水分和当季蔬果；若天气潮湿，可适量选择薏米、山药等健脾祛湿食材。`;
    },
  },
};

function matchType(message = '') {
  const normalized = String(message);
  if (['穿什么', '穿衣', '衣服'].some(keyword => normalized.includes(keyword))) return 'clothing';
  if (['出行', '交通', '通勤', '旅游'].some(keyword => normalized.includes(keyword))) return 'travel';
  if (['活动', '运动', '锻炼', '跑步'].some(keyword => normalized.includes(keyword))) return 'activity';
  if (['饮食', '吃', '食物', '养生'].some(keyword => normalized.includes(keyword))) return 'diet';
  return 'general';
}

function buildGeneralReply({ message, city, weather, solarTerm }) {
  const type = matchType(message);
  if (type !== 'general') {
    return suggestionMap[type].build({ city, weather, solarTerm });
  }

  const desc = weather?.description || '天气状况暂未获取';
  const temp = Number.isFinite(Number(weather?.temp)) ? `${Math.round(Number(weather.temp))}°` : '温度未知';
  const term = solarTerm?.name ? `，当前节气参考：${solarTerm.name}` : '';
  return `${city || '当前城市'}现在${desc}，${temp}${term}。你可以问我“今天穿什么”“适合出行吗”“适合运动吗”或“饮食建议”。`;
}

router.post('/chat', (req, res) => {
  const { message = '', city, weather, solarTerm } = req.body;
  res.json({
    reply: buildGeneralReply({ message, city, weather, solarTerm }),
  });
});

router.post('/advice', (req, res) => {
  const { type, city, weather, solarTerm } = req.body;
  const item = suggestionMap[type];
  if (!item) return res.status(400).json({ error: '未知建议类型' });

  res.json({
    title: item.title,
    reply: item.build({ city, weather, solarTerm }),
  });
});

module.exports = router;
