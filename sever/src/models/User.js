const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Counter = require('./Counter');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  nickname: {
    type: String,
    default: '晴天小暖',
    trim: true,
    maxlength: 24,
  },
  avatarUrl: {
    type: String,
    default: '',
    trim: true,
  },
  favorites: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
}, { timestamps: true });

// 保存前自动加密密码
userSchema.pre('save', async function () {
  if (this.isNew && !this.userId) {
    const counter = await Counter.findOneAndUpdate(
      { name: 'userId' },
      { $inc: { value: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    this.userId = String(counter.value).padStart(7, '0');
  }

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// 验证密码
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
