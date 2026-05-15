// mimoClient - thin wrapper to call MIMO API. You can replace or extend this file.

const axios = require('axios');

async function parseText(text) {
  const res = await axios.post(process.env.MIMO_API_URL, { text }, {
    headers: { Authorization: `Bearer ${process.env.MIMO_API_KEY}` }
  });
  return res.data;
}

module.exports = { parseText };
