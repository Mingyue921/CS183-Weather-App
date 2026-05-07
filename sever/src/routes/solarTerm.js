const express = require('express');
const path = require('path');
const router = express.Router();

const terms = require(path.join(__dirname, '..', 'data', 'solarTerms.json'));

// MM-DD → M*100+D 数值，用于区间比较
const toInt = (mmdd) => {
  const [m, d] = mmdd.split('-').map(Number);
  return m * 100 + d;
};

// GET /api/solar-term?date=2026-04-20
router.get('/', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });

  const d = new Date(date);
  if (isNaN(d.getTime())) return res.status(400).json({ error: 'invalid date format, use YYYY-MM-DD' });

  const cur = (d.getMonth() + 1) * 100 + d.getDate();

  for (const term of terms) {
    const start = toInt(term.startDate);
    const end = toInt(term.endDate);
    if (start <= end) {
      if (cur >= start && cur <= end) return res.json({ solarTerm: term });
    } else {
      // 跨年区间（如冬至 12-22 ~ 01-04）
      if (cur >= start || cur <= end) return res.json({ solarTerm: term });
    }
  }

  res.json({ solarTerm: null, message: 'No solar term found for this date' });
});

// GET /api/solar-term/all — 返回全部24节气
router.get('/all', (req, res) => {
  res.json({ solarTerms: terms });
});

module.exports = router;
