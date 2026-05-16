const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

// GET /api/ai/tasks/:id - get task status/result
router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task || task.user_id !== req.userId) return res.status(404).json({ error: 'Not found' });
    res.json({ id: task.id, status: task.status, result: task.result, error_message: task.error_message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
