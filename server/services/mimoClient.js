const axios = require('axios');

async function parseText(text) {
  if (!process.env.MIMO_API_URL || !process.env.MIMO_API_KEY) {
    const msg = 'MIMO API not configured. Please set MIMO_API_URL and MIMO_API_KEY environment variables.';
    // Throw an Error so callers can handle it, but include clear message
    throw new Error(msg);
  }

  try {
    console.log('[mimoClient] Using MIMO API Key prefix:', process.env.MIMO_API_KEY?.substring(0, 4));
    const res = await axios.post(process.env.MIMO_API_URL, { text }, {
      headers: {
        Authorization: `Bearer ${process.env.MIMO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    return res.data;
  } catch (err) {
    // Log detailed information to help debugging
    console.error('[mimoClient] MIMO API request failed. URL:', process.env.MIMO_API_URL);
    if (err.response) {
      console.error('[mimoClient] MIMO response status:', err.response.status);
      console.error('[mimoClient] MIMO response data:', err.response.data);
    } else {
      console.error('[mimoClient] MIMO request error:', err.message);
    }
    // Re-throw so caller can mark task as error or mock
    throw err;
  }
}

module.exports = { parseText };
