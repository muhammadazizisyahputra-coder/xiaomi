const api = require('../../utils/api');

Page({
  data: {
    draft: '',
    notes: []
  },
  onLoad() {
    this.fetchNotes();
  },
  async fetchNotes() {
    const res = await api.get('/notes');
    this.setData({ notes: res });
  },
  onInput(e) {
    this.setData({ draft: e.detail.value });
  },
  async createNote() {
    const content = this.data.draft.trim();
    if (!content) return wx.showToast({ title: '内容为空', icon: 'none' });
    await api.post('/notes', { content });
    this.setData({ draft: '' });
    this.fetchNotes();
  },
  async deleteNote(e) {
    const id = e.currentTarget.dataset.id;
    await api.delete(`/notes/${id}`);
    this.fetchNotes();
  },
  async parseNote(e) {
    const id = e.currentTarget.dataset.id;
    const note = this.data.notes.find(n => n.id === id);
    if (!note) return;
    const resp = await api.post('/ai/parse', { noteId: id, content: note.content });
    wx.showToast({ title: '解析完成', icon: 'success' });
    this.fetchNotes();
  }
});
