const redis = require('redis');
const { REDIS_CONF } = require('../config/db');

// 创建客户端
const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host);

// 监视error
redisClient.on('error', (err) => {
  console.log(`redisClient err: ${err}`);
});

function set(key, val) {
  if (typeof val === 'object') {
    val = JSON.stringify(val);
  }
  redisClient.set(key, val, redis.print);
}

function get(key) {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, val) => {
      if (err) {
        reject(err);
        return;
      }

      if (val == null) {
        resolve(null);
        return;
      }

      try {
        resolve(JSON.parse(val));
      } catch (e) {
        resolve(val);
      }
    });
  })
}

module.exports = {
  get,
  set
};