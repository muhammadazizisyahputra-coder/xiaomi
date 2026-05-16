// simple wrapper for backend API calls with token and 401/500 handling
const BASE = 'http://localhost:8080'; // for local testing

function getTokenHeader() {
  const token = wx.getStorageSync('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handle401() {
  // remove token and redirect to login
  try { wx.removeStorageSync('token'); } catch (e) {}
  wx.showToast({ title: '未授权或登录已过期，请重新登录', icon: 'none' });
  wx.navigateTo({ url: '/pages/login/login' });
}

function handleServerError(message) {
  wx.showToast({ title: message || '服务器错误', icon: 'none' });
}

module.exports = {
  get(path) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: BASE + '/api' + path,
        method: 'GET',
        header: Object.assign({ 'Content-Type': 'application/json' }, getTokenHeader()),
        success(r) {
          if (r.statusCode === 401) { handle401(); return reject({ error: 'unauthorized' }); }
          if (r.statusCode >= 500) { handleServerError(r.data?.error || '服务器错误'); return reject(r.data || { error: 'server error' }); }
          if (r.statusCode >= 400) { wx.showToast({ title: r.data?.error || '请求失败', icon: 'none' }); return reject(r.data || { error: 'request failed' }); }
          resolve(r.data);
        },
        fail(err) { wx.showToast({ title: '网络错误', icon: 'none' }); reject(err); }
      })
    });
  },
  post(path, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: BASE + '/api' + path,
        method: 'POST',
        data,
        header: Object.assign({ 'Content-Type': 'application/json' }, getTokenHeader()),
        success(r) {
          if (r.statusCode === 401) { handle401(); return reject({ error: 'unauthorized' }); }
          if (r.statusCode >= 500) { handleServerError(r.data?.error || '服务器错误'); return reject(r.data || { error: 'server error' }); }
          if (r.statusCode >= 400) { wx.showToast({ title: r.data?.error || '请求失败', icon: 'none' }); return reject(r.data || { error: 'request failed' }); }
          resolve(r.data);
        },
        fail(err) { wx.showToast({ title: '网络错误', icon: 'none' }); reject(err); }
      })
    });
  },
  delete(path) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: BASE + '/api' + path,
        method: 'DELETE',
        header: Object.assign({ 'Content-Type': 'application/json' }, getTokenHeader()),
        success(r) {
          if (r.statusCode === 401) { handle401(); return reject({ error: 'unauthorized' }); }
          if (r.statusCode >= 500) { handleServerError(r.data?.error || '服务器错误'); return reject(r.data || { error: 'server error' }); }
          if (r.statusCode >= 400) { wx.showToast({ title: r.data?.error || '请求失败', icon: 'none' }); return reject(r.data || { error: 'request failed' }); }
          resolve(r.data);
        },
        fail(err) { wx.showToast({ title: '网络错误', icon: 'none' }); reject(err); }
      })
    });
  }
};
