const express = require('express');
const PostsService = require('./posts-service');
const { requireAuth } = require('../middleware/jwt-auth');
const { requireMember } = require('../middleware/user-role-verification');

const postsRouter = express.Router();
postsRouter.use(express.json());
postsRouter.use(requireAuth);

postsRouter
  .route('/:project_id')
  .get(async (req, res, next) => {
    const db = req.app.get('db');
    const { project_id } = req.params;

    try {
      const allPosts = await PostsService.getPosts(db, project_id);
      const user_id = req.user.id;

      res
        .status(200)
        .json(allPosts.map(post => PostsService.serializePost(post, user_id)));
    } catch (error) {
      next(error);
    }
  })

  .post(requireAuth, requireMember, async (req, res, next) => {
    const db = req.app.get('db');
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
      const resultingPost = await PostsService.insertItem(db, newPost);

      return res
        .status(201)
        .json(PostsService.serializePost(resultingPost, user_id));
    } catch (error) {
      next(error);
    }
  });

postsRouter
  .route('/:id')
  .patch(requireAuth, requireMember, async (req, res, next) => {
    const db = req.app.get('db');
    const post_id = req.params.id;
    const { message } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ error: `Missing 'message' in request body` });
    }

    try {
      const updatedPost = { message };
      await PostsService.updateItem(db, post_id, updatedPost);
      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

module.exports = postsRouter;
