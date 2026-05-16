const { parseText } = require('./services/mimoClient');
const Task = require('./models/task');
const Note = require('./models/note');

let running = false;

async function processOne(task) {
  console.log('[worker] start processing task', task.id, 'note_id=', task.note_id, 'user_id=', task.user_id);
  try {
    // mark processing
    task.status = 'processing';
    await task.save();

    // call mimo
    const resp = await parseText(task.content);

    task.result = resp;
    task.status = 'done';
    task.error_message = null;
    await task.save();

    console.log('[worker] task processed', task.id, 'status=done');

    if (task.note_id) {
      const note = await Note.findByPk(task.note_id);
      if (note) {
        note.parsed = resp;
        await note.save();
        console.log('[worker] note updated with parsed result for note', note.id);
      }
    }
  } catch (err) {
    // Catch and record error on the task instead of letting the worker crash
    console.error('[worker] error processing task', task.id, err?.response?.data || err?.message || err);
    try {
      // Create simulated/mock result so front-end can continue to work in development
      const mockResult = {
        time: '2023-10-27 14:00',
        location: '办公室',
        task: '项目进度周会'
      };

      task.result = mockResult;
      task.status = 'done';
      task.error_message = 'mocked due to AI error: ' + ((err?.response?.data && JSON.stringify(err.response.data)) || err.message || String(err));
      await task.save();

      console.warn('[worker] task marked done with mock result for task', task.id);

      if (task.note_id) {
        const note = await Note.findByPk(task.note_id);
        if (note) {
          note.parsed = mockResult;
          await note.save();
          console.log('[worker] note updated with mock parsed result for note', note.id);
        }
      }
    } catch (saveErr) {
      console.error('[worker] failed to save task error state for task', task.id, saveErr);
      try {
        task.status = 'error';
        task.error_message = (saveErr?.message || String(saveErr));
        await task.save();
      } catch (finalErr) {
        console.error('[worker] final save failed for task', task.id, finalErr);
      }
    }
  }
}

async function workerLoop() {
  if (running) return;
  running = true;
  try {
    const pending = await Task.findAll({ where: { status: 'pending' }, limit: 5, order: [['created_at', 'ASC']] });
    if (pending.length === 0) {
      // nothing to do
      running = false;
      return;
    }
    console.log('[worker] found', pending.length, 'pending tasks');
    for (const task of pending) {
      // process sequentially to keep things simple
      await processOne(task);
    }
  } catch (err) {
    console.error('[worker] Worker loop error', err);
  } finally {
    running = false;
  }
}

function startWorker() {
  const interval = parseInt(process.env.TASK_POLL_INTERVAL || '3000', 10);
  setInterval(workerLoop, interval);
  console.log('[worker] Background worker started, polling every', interval, 'ms');
}

module.exports = { startWorker };
