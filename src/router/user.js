const { loginCheck } = require('../controller/user');
const { SuccessModel, ErrorModel } = require('../model/resModel');
const { set } = require('../../db/redis');

const handleUserRouter = (req, res) => {
  const { method, path } = req;

  if (method === 'POST') {
    // 登录
    if (path === '/api/user/login') {
      const { username, password } = req.body;
      return loginCheck(username, password)
        .then((data) => {
          if (data.username) {
            // 设置session
            req.session.username = data.username;
            req.session.realname = data.realname;
            // 存储 session 到 redis 中
            set(req.sessionId, req.session);

            console.log(`req.session is `, req.session);

            return new SuccessModel();
          } else {
            return new ErrorModel('登录失败');
          }
        })
        .catch(() => {
          return new ErrorModel('登录失败');
        })
    }
  }

};

module.exports = handleUserRouter;