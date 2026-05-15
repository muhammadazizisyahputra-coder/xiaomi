// simple wrapper for backend API calls
const BASE = 'https://YOUR_SERVER_URL'; // <-- replace with your deployed server

function handleRes(res) {
  if (res.statusCode && res.statusCode !== 200) throw new Error('Network error');
  return res.data;
}

module.exports = {
  get(path) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: BASE + '/api' + path,
        method: 'GET',
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
        header: { 'Content-Type': 'application/json' },
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
        success(r) { resolve(r.data); },
        fail(err) { reject(err); }
      })
    });
  }
};
