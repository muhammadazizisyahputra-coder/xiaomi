// simple wrapper for backend API calls
const BASE = 'https://YOUR_SERVER_URL'; // <-- replace with your deployed server

function getTokenHeader() {
  const token = wx.getStorageSync('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

module.exports = {
  get(path) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: BASE + '/api' + path,
        method: 'GET',
        header: Object.assign({ 'Content-Type': 'application/json' }, getTokenHeader()),
        success(r) { resolve(r.data); },
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
        success(r) { resolve(r.data); },
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
        success(r) { resolve(r.data); },
        fail(err) { reject(err); }
      })
    });
  }
};
