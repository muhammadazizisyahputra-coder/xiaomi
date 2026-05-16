Page({
  data: { username: '', password: '' },
  onUsername(e) { this.setData({ username: e.detail.value }); },
  onPassword(e) { this.setData({ password: e.detail.value }); },
  async onRegister() {
    const { username, password } = this.data;
    if (!username || !password) return wx.showToast({ title: '请输入用户名和密码', icon: 'none' });
    try {
      const api = require('../../utils/api');
      const res = await api.post('/auth/register', { username, password });
      if (res && res.token) {
        wx.setStorageSync('token', res.token);
        wx.showToast({ title: '注册成功', icon: 'success' });
        wx.reLaunch({ url: '/pages/index/index' });
      } else {
        wx.showToast({ title: '注册失败', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: err?.error || '注册出错', icon: 'none' });
    }
  },
  toLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  }
});
