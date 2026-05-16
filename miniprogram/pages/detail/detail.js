const api = require('../../utils/api');
let pollInterval = null;

Page({
  data: { note: {}, parsing: false, taskStatus: '', formattedResult: '' },
  onLoad(options) {
    this.noteId = options.id;
    this.fetchNote();
  },
  async fetchNote() {
    try {
      const note = await api.get(`/notes/${this.noteId}`);
      this.setData({ note });
      if (note.parsed) this.setData({ formattedResult: JSON.stringify(note.parsed) });
    } catch (err) {
      wx.showToast({ title: '获取笔记失败', icon: 'none' });
    }
  },
  async startParse() {
    if (this.data.parsing) return;
    this.setData({ parsing: true, taskStatus: 'pending' });
    try {
      const resp = await api.post('/ai/parse', { noteId: this.noteId, content: this.data.note.content });
      const taskId = resp.taskId;
      if (!taskId) throw new Error('no task id');
      this.pollTask(taskId);
    } catch (err) {
      this.setData({ parsing: false });
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
          if (t.result) {
            this.setData({ formattedResult: JSON.stringify(t.result) });
          }
          // refresh note to get parsed field
          this.fetchNote();
        } else if (t.status === 'error') {
          clearInterval(pollInterval);
          pollInterval = null;
          this.setData({ parsing: false });
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
      this.setData({ parsing: false, taskStatus: 'cancelled' });
    }
  },
  onUnload() {
    if (pollInterval) clearInterval(pollInterval);
  }
});
