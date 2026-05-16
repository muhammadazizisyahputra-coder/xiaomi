require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/ai', require('./routes/aiTasks'));

const PORT = process.env.PORT || 8080;

// Global error handlers to ensure server logs unexpected problems
process.on('unhandledRejection', (reason, p) => {
  console.error('[server] Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught Exception thrown', err);
});

// Test DB and start
(async () => {
  try {
    await sequelize.authenticate();
    console.log('[server] Database connected');
    // Do not force sync in production. Run migrations instead.
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`[server] Server listening on port ${PORT}`);
    });

    // start background worker
    const { startWorker } = require('./worker');
    startWorker();
  } catch (err) {
    console.error('[server] Unable to start server:', err);
    process.exit(1);
  }
})();
