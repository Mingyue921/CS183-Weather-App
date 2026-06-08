const fs = require('fs/promises');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'data', 'ai-responses.local.json');

/**
 * Author: Chen Chuqi
 */
async function readStore() {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Author: Chen Chuqi
 */
async function appendAiResponse(entry) {
  const store = await readStore();
  store.unshift({
    ...entry,
    createdAt: new Date().toISOString(),
  });
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store.slice(0, 200), null, 2), 'utf8');
}

module.exports = { appendAiResponse };
