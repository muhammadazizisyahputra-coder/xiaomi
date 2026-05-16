const express = require('express');
const axios = require('axios');
const router = express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

// POST /api/ai/parse - create a parsing task and return task id
router.post('/parse', auth, async (req, res) => {
  try {
    const { noteId, content } = req.body;
    if (!content) return res.status(400).json({ error: 'content required' });

    console.log('[api/ai/parse] create task for user', req.userId, 'noteId', noteId, 'content length', (content && content.length) || 0);

    const task = await Task.create({ user_id: req.userId, note_id: noteId || null, content, status: 'pending' });

    // Log whether MIMO env is configured (do not print keys)
    console.log('[api/ai/parse] MIMO configured:', !!process.env.MIMO_API_URL, !!process.env.MIMO_API_KEY);

    // If mimo is not configured, mark task as error immediately with clear message
    if (!process.env.MIMO_API_URL || !process.env.MIMO_API_KEY) {
      const msg = 'MIMO API not configured on server.';
      console.warn('[api/ai/parse] ' + msg);
      try {
        task.status = 'error';
        task.error_message = msg;
        await task.save();
      } catch (err) {
        console.error('[api/ai/parse] failed to mark task error', err);
      }
      return res.status(500).json({ error: msg, taskId: task.id });
    }

    res.status(202).json({ taskId: task.id });
  } catch (err) {
    console.error('[api/ai/parse] Create task failed:', err?.response?.data || err.message || err);
    res.status(500).json({ error: 'Create task failed', details: err.message || String(err) });
  }
});

module.exports = router;
