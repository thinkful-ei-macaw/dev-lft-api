const xss = require('xss');

const PostsService = {
  getPostByProjects(db, project_id) {
    return db
      .raw(
        `
      SELECT
        posts.id,
        posts.user_id,
        posts.message,
        posts.date_created,
        users.first_name,
        users.last_name
      FROM
        posts
      JOIN
        users
      ON
        posts.user_id = users.id
      WHERE
        posts.project_id = ?
      `,
        [project_id]
      )
      .then(result => result.rows);
  },

  getPostById(db, id) {
    return db('posts').where({ id }).first();
  },

  insertNewPost(db, newPost) {
    return db
      .insert(newPost)
      .into('posts')
      .returning('*')
      .then(([message]) => message)
      .then(message => this.getPostById(db, message.id));
  },

  updatePost(db, id, message) {
    return db
      .from('posts')
      .where({ id })
      .update({ message })
      .returning('*')
      .then(rows => rows[0]);
  },
  serializePost(post) {
    return {
      id: post.id,
      user_id: post.user_id,
      message: xss(post.message),
      date_created: post.date_created,
      first_name: post.first_name,
      last_name: post.last_name
    };
  }
};

module.exports = PostsService;
