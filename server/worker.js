const { parseText } = require('./services/mimoClient');
const Task = require('./models/task');
const Note = require('./models/note');
const { sequelize } = require('./db');

let running = false;

async function processOne(task) {
  try {
    // mark processing
    task.status = 'processing';
    await task.save();

    // call mimo
    const resp = await parseText(task.content);

    task.result = resp;
    task.status = 'done';
    await task.save();

    if (task.note_id) {
      const note = await Note.findByPk(task.note_id);
      if (note) {
        note.parsed = resp;
        await note.save();
      }
    }
  } catch (err) {
    console.error('Worker error processing task', task.id, err?.message || err);
    task.status = 'error';
    task.error_message = (err?.message || JSON.stringify(err)) + '';
    await task.save();
  }
}

async function workerLoop() {
  if (running) return;
  running = true;
  try {
    const pending = await Task.findAll({ where: { status: 'pending' }, limit: 5, order: [['created_at', 'ASC']] });
    for (const task of pending) {
      // process sequentially to keep things simple
      await processOne(task);
    }
  } catch (err) {
    console.error('Worker loop error', err);
  } finally {
    running = false;
  }
}

function startWorker() {
  const interval = parseInt(process.env.TASK_POLL_INTERVAL || '3000', 10);
  setInterval(workerLoop, interval);
  console.log('Background worker started, polling every', interval, 'ms');
}

module.exports = { startWorker };
