
const env = process.env.NODE_ENV;

// 配置
let MYSQL_CONF = null;
let REDIS_CONF = null;

if (env === 'development') {
  // mysql
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: '3306',
    database: 'myblog'
  };
  // redis
  REDIS_CONF = {
    host: '127.0.0.1',
    port: 6379
  }
}

if (env === 'production') {
  // 生产环境本应是上线地址，但是我们没有。。
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: '3306',
    database: 'myblog'
  };
  // redis
  REDIS_CONF = {
    host: '127.0.0.1',
    port: 6379
  }
}

module.exports = {
  MYSQL_CONF,
  REDIS_CONF
};