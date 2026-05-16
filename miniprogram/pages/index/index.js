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
    try {
      const res = await api.get('/notes');
      this.setData({ notes: res || [] });
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '获取笔记失败', icon: 'none' });
    }
  },
  onInput(e) {
    this.setData({ draft: e.detail.value });
  },
  async createNote() {
    const content = this.data.draft.trim();
    if (!content) return wx.showToast({ title: '内容为空', icon: 'none' });
    try {
      await api.post('/notes', { content });
      this.setData({ draft: '' });
      this.fetchNotes();
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
      console.error(err);
    }
  },
  async deleteNote(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await api.delete(`/notes/${id}`);
      this.fetchNotes();
    } catch (err) {
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },
  openDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },
  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  },
  focusInput() {
    // focus not straightforward; just show toast to instruct
    wx.showToast({ title: '请在下方输入框输入备忘并保存', icon: 'none' });
  }
});
