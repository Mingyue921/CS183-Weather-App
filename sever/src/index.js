require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const weatherRoutes = require('./routes/weather');
const solarTermRoutes = require('./routes/solarTerm');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-app';

app.locals.dbReady = false;

app.use(cors());
app.use(express.json());

app.use('/api/weather', weatherRoutes);
app.use('/api/solar-term', solarTermRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/ai', aiRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    app.locals.dbReady = true;
    console.log('MongoDB 已连接');
    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB 连接失败:', err.message);
    console.log('已启用本地 JSON 用户存储：sever/src/data/users.local.json');
    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://localhost:${PORT}（本地文件用户存储）`);
    });
  });
