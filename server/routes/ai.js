const express = require('express');
const router = express.Router();
const axios = require('axios');
const Note = require('../models/note');

// POST /api/ai/parse - parse note content using MIMO
router.post('/parse', async (req, res) => {
  try {
    const { noteId, content } = req.body;
    if (!content) return res.status(400).json({ error: 'content required' });

    // Call mimo service
    const mimoResp = await axios.post(process.env.MIMO_API_URL, {
      text: content
    }, {
      headers: {
        Authorization: `Bearer ${process.env.MIMO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const parsed = mimoResp.data;

    // Optionally save parsed result to note
    if (noteId) {
      const note = await Note.findByPk(noteId);
      if (note) {
        note.parsed = parsed;
        await note.save();
      }
    }

    res.json({ parsed });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: 'AI parse failed', details: err.message });
  }
});

module.exports = router;
