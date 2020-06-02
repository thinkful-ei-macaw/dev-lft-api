const express = require('express');
const PostsService = require('./posts-service');
const { requireAuth } = require('../middleware/jwt-auth');

const postsRouter = express.Router();
postsRouter.use(express.json());
postsRouter.use(requireAuth);

postsRouter
  .route('/:project_id')
  .get(async (req, res, next) => {
    const { project_id } = req.params;

    try {
      const allPosts = await PostsService.getPostByProjects(
        req.app.get('db'),
        project_id
      );

      const user_id = req.user.id;

      res.status(200).json(allPosts.map(post => PostsService.serializePost(post, user_id)));
    } catch (e) {
      next(e);
    }
  })

  .post(async (req, res, next) => {
    const { project_id } = req.params;
    const user_id = req.user.id;
    const { message } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ error: `Missing 'message' in request body` });
    }

    const newPost = {
      project_id,
      user_id,
      message
    };

    try {
      const resultingPost = await PostsService.insertNewPost(
        req.app.get('db'),
        newPost
      );

      return res.status(201).json(PostsService.serializePost(resultingPost, user_id));
    } catch (e) {
      next(e);
    }
  });

postsRouter
  .route('/:post_id')
  .patch(async (req, res, next) => {
    const { post_id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ error: `Missing 'message' in request body` });
    }

    try {
      const resultingPost = await PostsService.updatePost(
        req.app.get('db'),
        post_id,
        message
      );

      const user_id = req.user_id;

      return res.status(201).json(PostsService.serializePost(resultingPost, user_id));
    } catch (e) {
      next(e);
    }
  });

module.exports = postsRouter;
