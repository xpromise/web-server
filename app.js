const querystring = require('querystring');
const handleBlogRouter = require('./src/router/blog');
const handleUserRouter = require('./src/router/user');
const { get, set } = require('./db/redis');
const { access } = require('./src/utils/log');
// session 数据
const SESSION_DATA = {};
// 获取 cookie 过期时间
const getCookieExpires = () => {
  const d = new Date();
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
  return d.toGMTString();
};
// 获取 post data
const getPostData = (req) => {
  return new Promise((resolve, reject) => {
    if (req.method !== 'POST') {
      resolve({});
      return
    }

    if (req.headers['content-type'] !== 'application/json') {
      resolve({});
      return
    }
    // 只接受post请求和json数据
    let postData = '';
    req.on('data', (chunk) => {
      postData += chunk.toString();
    });
    req.on('end', () => {

      if (!postData) {
        resolve({});
        return;
      }

      resolve(JSON.parse(postData));
    })

  })
};

const serverHandle = async (req, res) => {
  // 记录access log
  access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${new Date().toLocaleString()}`);
  // 设置返回格式
  res.setHeader('Content-Type', 'application/json');

  const url = req.url;
  req.path = url.split('?')[0];

  // 解析query
  req.query = querystring.parse(url.split('?')[1]);
  // 解析body
  req.body = await getPostData(req);

  // 解析cookie
  req.cookies = {};

  const cookieStr = req.headers.cookie || '';

  cookieStr.split(';').forEach((item) => {
    if (!item) return;
    const arr = item.split('=');
    req.cookies[arr[0].trim()] = arr[1].trim();
  });

  console.log('cookie is ', req.cookies);

  // 解析session
  /*let needSetCookie = false;
  let userId = req.cookies.userid;
  if (userId) {
    /!*if (SESSION_DATA[userId]) {
      req.session = SESSION_DATA[userId];
    } else {
      SESSION_DATA[userId] = {};
      req.session = SESSION_DATA[userId];
    }*!/
    if (!SESSION_DATA[userId]) {
      SESSION_DATA[userId] = {};
    }
  } else {
    needSetCookie = true;
    userId = `${Date.now()}_${Math.random()}`;
    SESSION_DATA[userId] = {};
  }
  req.session = SESSION_DATA[userId];*/
  // 解析session （使用redis）
  let needSetCookie = false;
  let userId = req.cookies.userid;
  if (!userId) {
    needSetCookie = true;
    userId = `${Date.now()}_${Math.random()}`;
    // 初始化 redis 中 session 值
    set(userId, {});
  }
  // 获取session
  req.sessionId = userId;
  const sessionData = await get(userId);
  if (sessionData == null) {
    // 初始化 redis 中 session 值
    set(userId, {});
    // 设置session
    req.session = {};
  } else {
    req.session = sessionData;
  }

  // 处理blog的路由
  const blogData = await handleBlogRouter(req, res);

  if (blogData) {
    if (needSetCookie) {
      res.setHeader('set-cookie', `userid=${userId};path=/;httpOnly;expires=${getCookieExpires()}`);
    }
    return res.end(JSON.stringify(blogData));
  }
  // 处理user的路由
  const userData = await handleUserRouter(req, res);

  if (userData) {
    if (needSetCookie) {
      res.setHeader('set-cookie', `userid=${userId};path=/;httpOnly;expires=${getCookieExpires()}`);
    }
    return res.end(JSON.stringify(userData));
  }

  // 未命中路由, 返回404
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.write('404 Not Found\n');
  res.end();

};

module.exports = serverHandle;