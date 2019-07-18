const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
} = require('../controller/blog');
const { SuccessModel, ErrorModel } = require('../model/resModel');

// 统一登录验证的中间件
const loginCheck = (req) => {
  if (!req.session.username) {
    return Promise.resolve(new ErrorModel('尚未登录'));
  }
};

const handleBlogRouter = async (req, res) => {
  const { method, path } = req;
  const id = req.query.id || '';

  if (method === 'GET') {
    // 获取博客列表
    if (path === '/api/blog/list') {
      let author = req.query.author || '';
      const keyword = req.query.keyword || '';
      console.log(req.query);
      
      if (req.query.isadmin) {
        const loginCheckResult = loginCheck(req);
        if (loginCheckResult) {
          return loginCheckResult
        }
        author = req.session.username;
      }
      // 通过controller查询数据
      return getList(author, keyword)
        .then((listData) => {
          return new SuccessModel(listData)
        })
        .catch((error) => {
          return new ErrorModel('获取博客失败~')
        });
    }
    // 获取博客详情
    if (path === '/api/blog/detail') {
      // 通过controller查询数据
      return getDetail(id)
        .then((detailData) => {
          return new SuccessModel(detailData);
        })
        .catch((error) => {
          return new ErrorModel('查询博客失败~')
        });
    }
  }

  if (method === 'POST') {
    // 新建一篇博客
    if (path === '/api/blog/new') {

      const loginCheckResult = loginCheck(req);
      if (loginCheckResult) {
        // 说明未登录
        return loginCheckResult;
      }
      // 假数据，待开发登录时开发成真数据
      req.body.author = req.session.username;

      return newBlog(req.body)
        .then((data) => {
          return new SuccessModel(data);
        })
        .catch((error) => {
          return new ErrorModel('新建博客失败~');
        });
    }
    // 更新一篇博客
    if (path === '/api/blog/update') {
      const loginCheckResult = loginCheck(req);
      if (loginCheckResult) {
        // 说明未登录
        return loginCheckResult;
      }

      return updateBlog(id, req.body)
        .then((val) => {
          if (val) {
            return new SuccessModel();
          } else {
            return new ErrorModel('更新博客失败~');
          }
        })
        .catch((error) => {
          return new ErrorModel('更新博客失败~');
        });

    }
    // 删除一篇博客
    if (path === '/api/blog/del') {
      const loginCheckResult = loginCheck(req);
      if (loginCheckResult) {
        // 说明未登录
        return loginCheckResult;
      }

      const author = req.session.username;
      return delBlog(id, author)
        .then((val) => {
            if (val) {
              return new SuccessModel();
            } else {
              return new ErrorModel('删除博客失败~');
            }
          })
        .catch((error) => {
          return new ErrorModel('删除博客失败~');
        });
    }

  }

};

module.exports = handleBlogRouter;