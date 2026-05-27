const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const localUsers = require('../localUserStore');
const router = express.Router();

// 所有收藏接口都需要登录
router.use(auth);

// GET /api/favorites — 获取收藏列表
router.get('/', async (req, res) => {
  try {
    if (req.user.local || !req.app.locals.dbReady) {
      const user = await localUsers.findById(req.user.id);
      if (!user) return res.status(404).json({ error: '用户不存在' });
      return res.json({ favorites: user.favorites });
    }

    const user = await User.findById(req.user.id);
    res.json({ favorites: user.favorites });
  } catch {
    res.status(500).json({ error: '获取收藏失败' });
  }
});

// POST /api/favorites — 添加收藏城市
router.post('/', async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) return res.status(400).json({ error: 'city 不能为空' });

    if (req.user.local || !req.app.locals.dbReady) {
      const user = await localUsers.findById(req.user.id);
      if (!user) return res.status(404).json({ error: '用户不存在' });
      const exists = user.favorites.some(item => JSON.stringify(item) === JSON.stringify(city));
      if (!exists) user.favorites.push(city);
      const updated = await localUsers.updateUser(req.user.id, { favorites: user.favorites });
      return res.json({ message: exists ? '该城市已在收藏中' : '收藏成功', favorites: updated.favorites });
    }

    const user = await User.findById(req.user.id);
    if (user.favorites.includes(city)) {
      return res.json({ message: '该城市已在收藏中', favorites: user.favorites });
    }
    user.favorites.push(city);
    await user.save();
    res.json({ message: '收藏成功', favorites: user.favorites });
  } catch {
    res.status(500).json({ error: '收藏失败' });
  }
});

// DELETE /api/favorites/:city — 删除收藏城市
router.delete('/:city', async (req, res) => {
  try {
    const cityName = decodeURIComponent(req.params.city);

    if (req.user.local || !req.app.locals.dbReady) {
      const user = await localUsers.findById(req.user.id);
      if (!user) return res.status(404).json({ error: '用户不存在' });
      user.favorites = user.favorites.filter(c => (c.name || c) !== cityName);
      const updated = await localUsers.updateUser(req.user.id, { favorites: user.favorites });
      return res.json({ message: '已取消收藏', favorites: updated.favorites });
    }

    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(c => c !== cityName);
    await user.save();
    res.json({ message: '已取消收藏', favorites: user.favorites });
  } catch {
    res.status(500).json({ error: '取消收藏失败' });
  }
});

module.exports = router;
