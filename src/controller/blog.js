const { exec, escape } = require('../../db/mysql');

const getList = (author, keyword) => {
  author = escape(author);
  keyword = escape(keyword);

  let sql = `select id, title, content, author, createtime from blogs where 1=1 `;
  if (author) {
    sql += `and author=${author} `;
  }
  if (keyword) {
    sql += `and title like %${keyword}% `;
  }
  sql += `order by createtime desc`;

  return exec(sql);
};

const getDetail = (id) => {
  const sql = `select * from blogs where id='${id}'`;
  return exec(sql).then((rows) => rows[0]);
};

const newBlog = (blogData = {}) => {
  const { title, content, author } = blogData;
  const createtime = Date.now();

  const sql = `insert into blogs (title, content, createtime, author) values ('${title}', '${content}', ${createtime}, '${author}');`;

  return exec(sql).then((insertData) => {
    console.log('insertData is ', insertData);
    return {
      id: insertData.insertId
    }
  })
};

const updateBlog = (id, blogData = {}) => {
  // id就是更新博客的id
  // 返blogData 是一个博客对象 包含title content
  const { title, content } = blogData;

  const sql = `update blogs set title='${title}', content='${content}' where id='${id}'`;

  return exec(sql).then((updateData) => {
    console.log('updateData is ', updateData);
    // return updateData.affectedRows > 0 ? true : false;
    return updateData.affectedRows > 0;
  });
};

const delBlog = (id, author) => {
  // id就是删除博客的id
  const sql = `delete from blogs where id='${id}' and author='${author}'`;

  return exec(sql).then((delData) => {
    console.log('delData is ', delData);
    return delData.affectedRows > 0;
  });
};

module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
};