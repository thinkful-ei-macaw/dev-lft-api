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

  serializePost(post, user_id) {
    return {
      id: post.id,
      message: xss(post.message),
      date_created: post.date_created,
      first_name: post.first_name,
      last_name: post.last_name,
      username: post.username,
      canEdit: post.user_id === user_id
    };
  }
}

module.exports = new PostsService('posts');
