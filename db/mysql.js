const mysql = require('mysql');
const { MYSQL_CONF } = require('../config/db');
// 创建连接对象
const connection = mysql.createConnection(MYSQL_CONF);
// 开始连接 - 异步的
connection.connect();
// 统一执行sql的函数
function exec(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (!err) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  })
}

module.exports = {
  exec,
  escape: mysql.escape
};