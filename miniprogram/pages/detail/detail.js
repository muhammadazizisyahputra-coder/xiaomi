const api = require('../../utils/api');
let pollInterval = null;

function extractSingle(parsed) {
  if (!parsed) return { time: '', location: '', task: '', raw: '' };
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch (e) { return { time: '', location: '', task: '', raw: parsed }; }
  }
  const out = { time: '', location: '', task: '', raw: '' };
  if (parsed.time) out.time = parsed.time;
  else if (parsed.times && parsed.times[0]) out.time = parsed.times[0];
  if (parsed.location) out.location = parsed.location;
  else if (parsed.locations && parsed.locations[0]) out.location = parsed.locations[0];
  if (parsed.task) out.task = parsed.task;
  else if (parsed.tasks && parsed.tasks[0]) out.task = parsed.tasks[0];
  if (!out.time && !out.location && !out.task) out.raw = JSON.stringify(parsed, null, 2);
  return out;
}

Page({
  data: { note: {}, parsing: false, taskStatus: '', formatted: { time:'', location:'', task:'', raw:'' }, formattedAvailable: false },
  onLoad(options) {
    this.noteId = options.id;
    this.fetchNote();
  },
  async fetchNote() {
    try {
      const note = await api.get(`/notes/${this.noteId}`);
      // prefer ai_content if present
      const parsedSource = note.ai_content || note.parsed || null;
      const formatted = extractSingle(parsedSource);
      this.setData({ note, formatted, formattedAvailable: !!(formatted.time || formatted.location || formatted.task) });
    } catch (err) {
      wx.showToast({ title: '获取笔记失败', icon: 'none' });
    }
  },
  async startParse() {
    if (this.data.parsing) return;
    this.setData({ parsing: true, taskStatus: 'pending' });
    wx.vibrateShort();
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
          wx.vibrateShort();
          wx.showToast({ title: '解析完成', icon: 'success' });
          if (t.result) {
            const formatted = extractSingle(t.result);
            this.setData({ formatted, formattedAvailable: !!(formatted.time || formatted.location || formatted.task) });
          }
          // refresh note to get ai_content
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
    wx.vibrateShort();
  },
  onUnload() {
    if (pollInterval) clearInterval(pollInterval);
    wx.hideLoading();
  }
});
