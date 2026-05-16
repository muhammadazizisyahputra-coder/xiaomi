const api = require('../../utils/api');
let pollInterval = null;

function normalizeArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}

function extractFromParsed(parsed) {
  const result = { times: [], locations: [], tasks: [], summary: '', raw: '' };
  if (!parsed) return result;
  // if string, try parse JSON
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch (e) { result.raw = parsed; return result; }
  }
  if (typeof parsed !== 'object') {
    result.raw = String(parsed);
    return result;
  }

  // Common heuristics
  const pushIf = (target, v) => { if (!v) return; if (Array.isArray(v)) v.forEach(x => target.push(String(x))); else target.push(String(v)); };

  // times: try several keys
  pushIf(result.times, parsed.time || parsed.times || parsed.datetime || parsed.date || parsed.dates || parsed.when || parsed.reminder_time);
  // locations
  pushIf(result.locations, parsed.location || parsed.locations || parsed.place || parsed.venue);
  // tasks or actions
  pushIf(result.tasks, parsed.tasks || parsed.actions || parsed.todos || parsed.items || parsed.tasks_list || parsed.instructions);

  // entities scanning
  if (parsed.entities && Array.isArray(parsed.entities)) {
    parsed.entities.forEach(ent => {
      if (!ent || !ent.type || !ent.value) return;
      const t = String(ent.type).toLowerCase();
      if (t.includes('time') || t.includes('date')) pushIf(result.times, ent.value);
      if (t.includes('location') || t.includes('place')) pushIf(result.locations, ent.value);
      if (t.includes('task') || t.includes('todo') || t.includes('action')) pushIf(result.tasks, ent.value);
    });
  }

  // summary or text
  if (parsed.summary) result.summary = String(parsed.summary);
  else if (parsed.text) result.summary = String(parsed.text);
  else if (parsed.description) result.summary = String(parsed.description);

  // fallback: if nothing captured, put raw JSON
  if (result.times.length === 0 && result.locations.length === 0 && result.tasks.length === 0 && !result.summary) {
    result.raw = JSON.stringify(parsed, null, 2);
  }

  return result;
}

Page({
  data: { note: {}, parsing: false, taskStatus: '', formatted: { times: [], locations: [], tasks: [], summary: '', raw: '' } },
  onLoad(options) {
    this.noteId = options.id;
    this.fetchNote();
  },
  async fetchNote() {
    try {
      const note = await api.get(`/notes/${this.noteId}`);
      const formatted = extractFromParsed(note.parsed);
      this.setData({ note, formatted });
    } catch (err) {
      wx.showToast({ title: '获取笔记失败', icon: 'none' });
    }
  },
  async startParse() {
    if (this.data.parsing) return;
    this.setData({ parsing: true, taskStatus: 'pending' });
    wx.showLoading({ title: '解析中...', mask: true });
    try {
      const resp = await api.post('/ai/parse', { noteId: this.noteId, content: this.data.note.content });
      const taskId = resp.taskId;
      if (!taskId) throw new Error('no task id');
      this.pollTask(taskId);
    } catch (err) {
      this.setData({ parsing: false });
      wx.hideLoading();
      wx.showToast({ title: '创建解析任务失败', icon: 'none' });
    }
  },
  pollTask(taskId) {
    const interval = 2000;
    pollInterval = setInterval(async () => {
      try {
        const t = await api.get(`/ai/tasks/${taskId}`);
        this.setData({ taskStatus: t.status });
        if (t.status === 'done') {
          clearInterval(pollInterval);
          pollInterval = null;
          this.setData({ parsing: false });
          wx.hideLoading();
          wx.showToast({ title: '解析完成', icon: 'success' });
          if (t.result) {
            const formatted = extractFromParsed(t.result);
            this.setData({ formatted });
          }
          // refresh note to get parsed field
          this.fetchNote();
        } else if (t.status === 'error') {
          clearInterval(pollInterval);
          pollInterval = null;
          this.setData({ parsing: false });
          wx.hideLoading();
          wx.showToast({ title: '解析失败', icon: 'none' });
        }
      } catch (err) {
        console.error('poll error', err);
      }
    }, interval);
  },
  cancelPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    this.setData({ parsing: false, taskStatus: 'cancelled' });
    wx.hideLoading();
  },
  onUnload() {
    if (pollInterval) clearInterval(pollInterval);
    wx.hideLoading();
  }
});
