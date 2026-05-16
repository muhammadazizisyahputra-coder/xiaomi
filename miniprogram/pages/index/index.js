const api = require('../../utils/api');

Page({
  data: {
    draft: '',
    notes: [],
    isAuthenticated: false
  },
  onLoad() {
    const token = wx.getStorageSync('token');
    const isAuth = !!token;
    this.setData({ isAuthenticated: isAuth });
    if (!isAuth) {
      // redirect to login if not authenticated
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.fetchNotes();
  },
  async fetchNotes() {
    try {
      const res = await api.get('/notes');
      const notes = (res || []).map(n => ({ ...n, displayDate: new Date(n.created_at).toLocaleString() }));
      this.setData({ notes });
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
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    try {
      wx.vibrateShort();
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
      wx.vibrateShort();
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
    wx.vibrateShort();
    wx.navigateTo({ url: '/pages/login/login' });
  },
  goRegister() {
    wx.vibrateShort();
    wx.navigateTo({ url: '/pages/register/register' });
  },
  focusInput() {
    wx.showToast({ title: '请在下方输入框输入备忘并保存', icon: 'none' });
  },
  async onLongPressDelete(e) {
    const id = e.currentTarget.dataset.id;
    const that = this;
    wx.vibrateShort();
    wx.showModal({
      title: '删除笔记',
      content: '确认删除该笔记吗？此操作不可恢复。',
      success(res) {
        if (res.confirm) {
          that.deleteNote({ currentTarget: { dataset: { id } } });
        }
      }
    });
  },
  logout() {
    wx.vibrateShort();
    try { wx.clearStorageSync(); } catch (e) { console.warn('clear storage failed', e); }
    wx.reLaunch({ url: '/pages/login/login' });
  }
});
