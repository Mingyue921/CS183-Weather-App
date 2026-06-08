const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');

const STORE_PATH = path.join(__dirname, 'data', 'users.local.json');

/**
 * Author: Chen Chuqi
 */
async function readStore() {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { nextUserNumber: 1, users: [] };
  }
}

/**
 * Author: Chen Chuqi
 */
async function writeStore(store) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

/**
 * Author: Chen Chuqi
 */
function toPublicUser(user) {
  return {
    id: user.userId,
    email: user.email,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    favorites: user.favorites,
  };
}

/**
 * Author: Chen Chuqi
 */
async function createUser({ email, password, nickname }) {
  const store = await readStore();
  const normalizedEmail = email.trim().toLowerCase();
  if (store.users.some(user => user.email === normalizedEmail)) {
    const error = new Error('该邮箱已注册');
    error.status = 409;
    throw error;
  }

  const user = {
    userId: String(store.nextUserNumber).padStart(7, '0'),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10),
    nickname: nickname || '晴天小暖',
    avatarUrl: '',
    favorites: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.nextUserNumber += 1;
  store.users.push(user);
  await writeStore(store);
  return user;
}

/**
 * Author: Chen Chuqi
 */
async function findByEmail(email) {
  const store = await readStore();
  return store.users.find(user => user.email === email.trim().toLowerCase()) || null;
}

/**
 * Author: Chen Chuqi
 */
async function findById(userId) {
  const store = await readStore();
  return store.users.find(user => user.userId === userId) || null;
}

/**
 * Author: Chen Chuqi
 */
async function updateUser(userId, updates) {
  const store = await readStore();
  const index = store.users.findIndex(user => user.userId === userId);
  if (index === -1) return null;

  store.users[index] = {
    ...store.users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(store);
  return store.users[index];
}

/**
 * Author: Chen Chuqi
 */
async function comparePassword(user, password) {
  return bcrypt.compare(password, user.password);
}

module.exports = {
  comparePassword,
  createUser,
  findByEmail,
  findById,
  toPublicUser,
  updateUser,
};
