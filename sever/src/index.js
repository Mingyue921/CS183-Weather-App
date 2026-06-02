require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const weatherRoutes = require('./routes/weather');
const solarTermRoutes = require('./routes/solarTerm');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');
const aiRoutes = require('./routes/ai');
const aiSuggestionsRoutes = require('./routes/aiSuggestions');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-app';

app.locals.dbReady = false;

// 请求日志
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.use(cors());
app.use(express.json());

app.use('/api/weather', weatherRoutes);
app.use('/api/solar-term', solarTermRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-suggestions', aiSuggestionsRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use((_req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 全局错误处理
app.use((err, _req, res, _next) => {
  console.error('未捕获错误:', err.message);
  res.status(500).json({ error: '服务器内部错误' });
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
