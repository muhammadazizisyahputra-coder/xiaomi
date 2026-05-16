const express = require('express');
const router = express.Router();
const axios = require('axios');
const Task = require('../models/task');
const auth = require('../middleware/auth');

// POST /api/ai/parse - create a parsing task and return task id
router.post('/parse', auth, async (req, res) => {
  try {
    const { noteId, content } = req.body;
    if (!content) return res.status(400).json({ error: 'content required' });

    const task = await Task.create({ user_id: req.userId, note_id: noteId || null, content, status: 'pending' });

    res.status(202).json({ taskId: task.id });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: 'Create task failed', details: err.message });
  }
});

module.exports = router;
