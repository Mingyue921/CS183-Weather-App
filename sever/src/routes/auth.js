const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const localUsers = require('../localUserStore');
const router = express.Router();

const toPublicUser = (user) => ({
  id: user.userId,
  mongoId: user._id,
  email: user.email,
  nickname: user.nickname,
  avatarUrl: user.avatarUrl,
  favorites: user.favorites,
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email 和 password 不能为空' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6位' });
    }

    if (!req.app.locals.dbReady) {
      const user = await localUsers.createUser({ email, password, nickname: nickname || '晴天小暖' });
      const token = jwt.sign({ id: user.userId, email: user.email, local: true }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        message: '注册成功',
        token,
        user: localUsers.toPublicUser(user),
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: '该邮箱已注册' });
    }

    const user = await User.create({ email, password, nickname: nickname || '晴天小暖' });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: '注册成功',
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error('注册错误:', err.message);
    res.status(err.status || 500).json({ error: err.status ? err.message : '注册失败，请稍后再试' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email 和 password 不能为空' });
    }

    if (!req.app.locals.dbReady) {
      const user = await localUsers.findByEmail(email);
      if (!user) return res.status(401).json({ error: '邮箱或密码错误' });

      const match = await localUsers.comparePassword(user, password);
      if (!match) return res.status(401).json({ error: '邮箱或密码错误' });

      const token = jwt.sign({ id: user.userId, email: user.email, local: true }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        message: '登录成功',
        token,
        user: localUsers.toPublicUser(user),
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: '登录成功',
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    res.status(500).json({ error: '登录失败，请稍后再试' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.local || !req.app.locals.dbReady) {
      const user = await localUsers.findById(req.user.id);
      if (!user) return res.status(404).json({ error: '用户不存在' });
      return res.json({ user: localUsers.toPublicUser(user) });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    res.json({ user: toPublicUser(user) });
  } catch {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// PATCH /api/auth/me
router.patch('/me', auth, async (req, res) => {
  try {
    const { nickname, avatarUrl } = req.body;
    const updates = {};

    if (typeof nickname === 'string') {
      const trimmed = nickname.trim();
      if (!trimmed) return res.status(400).json({ error: '昵称不能为空' });
      if (trimmed.length > 24) return res.status(400).json({ error: '昵称不能超过24个字符' });
      updates.nickname = trimmed;
    }

    if (typeof avatarUrl === 'string') {
      updates.avatarUrl = avatarUrl.trim();
    }

    if (req.user.local || !req.app.locals.dbReady) {
      const user = await localUsers.updateUser(req.user.id, updates);
      if (!user) return res.status(404).json({ error: '用户不存在' });
      return res.json({ message: '保存成功', user: localUsers.toPublicUser(user) });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!user) return res.status(404).json({ error: '用户不存在' });
    res.json({ message: '保存成功', user: toPublicUser(user) });
  } catch {
    res.status(500).json({ error: '保存用户信息失败' });
  }
});

module.exports = router;
