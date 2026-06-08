const axios = require('axios');
const https = require('https');

const API_KEY = process.env.DEEPSEEK_API_KEY || '';
const BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

const api = axios.create({
  httpsAgent: new https.Agent({ family: 4 }),
  timeout: 15000,
});

/**
 * Author: Zhang Yuhan
 */
async function chat(messages) {
  const response = await api.post(
    `${BASE_URL}/v1/chat/completions`,
    {
      model: 'deepseek-chat',
      messages,
      temperature: 0.6,
      max_tokens: 1024,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  return response.data.choices[0].message.content;
}

module.exports = { chat };