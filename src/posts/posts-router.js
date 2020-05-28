const express = require('express');
const PostsService = require('./posts-service');
const { requireAuth } = require('../middleware/jwt-auth');

const postsRouter = express.Router();
const bodyParser = express.json();

postsRouter
  .route('/:project_id')
  .all(requireAuth)
  .get(async (req, res, next) => {
    const { project_id } = req.params;

    try {
      const allPosts = await PostsService.getPostByProjects(
        req.app.get('db'),
        project_id
      );

      res.status(200).json({ allPosts });
    } catch (e) {
      next(e);
    }
  })
  .post(bodyParser, async (req, res, next) => {
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

      return res.status(201).json({ resultingPost });
    } catch (e) {
      next(e);
    }
  });

postsRouter
  .route('/:post_id')
  .all(requireAuth)
  .patch(bodyParser, async (req, res, next) => {
    const { post_id } = req.params;
    const user_id = req.user.id;
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

      return res.status(201).json({ resultingPost });
    } catch (e) {
      next(e);
    }
  });

module.exports = postsRouter;
