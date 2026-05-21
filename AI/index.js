require('dotenv').config({ override: true });
const express = require('express');
const aiAdviceRouter = require('./ai/routes/aiAdvice');
const aiChatRouter = require('./ai/routes/aiChat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  next(err);
});

app.use('/api/ai', aiAdviceRouter);
app.use('/api/ai', aiChatRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message, err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AI Service running on http://localhost:${PORT}`);
  console.log(`API base: http://localhost:${PORT}/api/ai`);
});

module.exports = app;
