// simple wrapper for backend API calls with token and 401 handling
const BASE = 'http://localhost:8080'; // for local testing

function getTokenHeader() {
  const token = wx.getStorageSync('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handle401() {
  // remove token and redirect to login
  try { wx.removeStorageSync('token'); } catch (e) {}
  wx.navigateTo({ url: '/pages/login/login' });
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
          if (r.statusCode >= 400) return reject(r.data || { error: 'request failed' });
          resolve(r.data);
        },
        fail(err) { reject(err); }
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
          if (r.statusCode >= 400) return reject(r.data || { error: 'request failed' });
          resolve(r.data);
        },
        fail(err) { reject(err); }
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
          if (r.statusCode >= 400) return reject(r.data || { error: 'request failed' });
          resolve(r.data);
        },
        fail(err) { reject(err); }
      })
    });
  }
};
