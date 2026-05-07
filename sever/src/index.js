require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const weatherRoutes = require('./routes/weather');
const solarTermRoutes = require('./routes/solarTerm');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-app';

app.use(cors());
app.use(express.json());

app.use('/api/weather', weatherRoutes);
app.use('/api/solar-term', solarTermRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB 已连接');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB 连接失败:', err.message);
    // 即便数据库没连上，也启动服务器（天气和节气接口不用数据库）
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}（无数据库）`);
    });
  });
