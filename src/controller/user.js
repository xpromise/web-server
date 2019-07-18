const { exec, escape } = require('../../db/mysql');

const loginCheck = (username, password) => {
  username = escape(username);
  password = escape(password);
  // 先使用假数据
  const sql = `select username, password, realname from users where username=${username} and password=${password}`;

  return exec(sql).then((rows) => rows[0] || {});
};

module.exports = {
  loginCheck
};