const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email 和 password 不能为空' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6位' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: '该邮箱已注册' });
    }

    const user = await User.create({ email, password });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: '注册成功',
      token,
      user: { id: user._id, email: user.email, favorites: user.favorites },
    });
  } catch (err) {
    console.error('注册错误:', err.message);
    res.status(500).json({ error: '注册失败，请稍后再试' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email 和 password 不能为空' });
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
      user: { id: user._id, email: user.email, favorites: user.favorites },
    });
  } catch (err) {
    res.status(500).json({ error: '登录失败，请稍后再试' });
  }
});

module.exports = router;
