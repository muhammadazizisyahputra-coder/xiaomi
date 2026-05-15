const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./db');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/api/notes', require('./routes/notes'));
app.use('/api/ai', require('./routes/ai'));

const PORT = process.env.PORT || 8080;

// Test DB and start
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    // Do not force sync in production. Run migrations instead.
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
})();
