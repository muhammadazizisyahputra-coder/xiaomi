const express = require('express');
const router = express.Router();
const Note = require('../models/note');

// Create note
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.create({ title, content });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.findAll({ order: [['created_at', 'DESC']] });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read one
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ error: 'Not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ error: 'Not found' });
    const { title, content } = req.body;
    note.title = title ?? note.title;
    note.content = content ?? note.content;
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ error: 'Not found' });
    await note.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
