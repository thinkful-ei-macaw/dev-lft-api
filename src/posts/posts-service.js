const xss = require('xss');
const Service = require('../base-service');

class PostsService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  getPosts(db, project_id) {
    return super
      .getItemsWhere(db, { project_id })
      .join('users', 'users.id', 'posts.user_id')
      .select(
        'posts.*',
        'users.first_name',
        'users.last_name',
        'users.username'
      )
      .orderBy('posts.date_created', 'desc');
  }

  getPostWithUser(db, post_id) {
    return db
      .raw(
        `
    SELECT p.id, 
    p.project_id, 
    p.user_id, 
    p.message, 
    p.date_created, u.first_name, u.last_name, u.username FROM posts p 
    INNER JOIN users u on u.id = p.user_id 
    WHERE p.id = ? 
    LIMIT 1
    `,
        [post_id]
      )
      .then(result => result.rows[0]);
  }

  getAllProjectUsers(db, project_id) {
    return db
      .raw(
        `
    SELECT DISTINCT(u.username) FROM users u 
    INNER JOIN projects p ON p.id = ? 
    INNER JOIN vacancies v ON v.project_id = p.id 
    WHERE p.creator_id = u.id OR v.user_id = u.id 
    AND v.user_id IS NOT NULL
    `,
        [project_id]
      )
      .then(result => result.rows);
  }

  validateMessage(message) {
    if (message.length > 280) {
      return 'message must be fewer than 280 characters';
    }
    if (message.length < 2) {
      return 'message must be longer than 2 characters';
    }
    let trim = message.trim();
    if (trim === '') {
      return 'message must have content';
    }
  }

  serializePost(post, username) {
    return {
      id: post.id,
      message: xss(post.message),
      date_created: post.date_created,
      author: {
        first_name: post.first_name,
        last_name: post.last_name,
        username: post.username
      },
      canEdit: post.username === username
    };
  }
}

module.exports = new PostsService('posts');
