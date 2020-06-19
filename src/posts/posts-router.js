const express = require('express');
const NotificationsService = require('../notifications/notifications-service');
const PostsService = require('./posts-service');
const { requireAuth } = require('../middleware/jwt-auth');
const { requireMember } = require('../middleware/user-role-verification');

const postsRouter = express.Router();
postsRouter.use(express.json());
postsRouter.use(requireAuth);

const WebSocketClients = require('../websocket-clients');

postsRouter
  .route('/:project_id')
  .get(async (req, res, next) => {
    const db = req.app.get('db');
    const { project_id } = req.params;

    try {
      const allPosts = await PostsService.getPosts(db, project_id);
      const username = req.user.username;

      res
        .status(200)
        .json(allPosts.map(post => PostsService.serializePost(post, username)));
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

    const postError = PostsService.validateMessage(message);

    if (postError) {
      return res.status(400).json({
        error: postError
      });
    }

    const newPost = {
      project_id,
      user_id,
      message
    };

    try {
      const resultingPost = await PostsService.insertItem(db, newPost);
      const resultingPostWithUser = await PostsService.getPostWithUser(
        db,
        resultingPost.id
      );

      // send notification to project members
      const usersToNotify = await NotificationsService.findProjectUsers(
        db,
        project_id,
        user_id,
        'post'
      );
      await NotificationsService.insertNotifications(
        db,
        usersToNotify,
        'post',
        project_id
      );

      // WEBSOCKET TESTING
      // If the recipient is connected via WebSocket,
      // send them the post in real time
      const projectUsers = await PostsService.getAllProjectUsers(
        db,
        project_id
      );

      projectUsers.forEach(user => {
        let connected = WebSocketClients.getClient(user.username);
        if (connected) {
          connected.ws.send(
            JSON.stringify({
              messageType: 'post',
              content: PostsService.serializePost(
                resultingPostWithUser,
                connected.username
              )
            })
          );
        }
      });

      return res
        .status(201)
        .json(
          PostsService.serializePost(resultingPostWithUser, req.user.username)
        );
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
      const postError = PostsService.validateMessage(message);

      if (postError) {
        return res.status(400).json({
          error: postError
        });
      }

      const updatedPost = { message };
      await PostsService.updateItem(db, post_id, updatedPost);

      // WEBSOCKET TESTING
      // If the recipient is connected via WebSocket,
      // send them the post in real time
      const resultingPost = await PostsService.getPostWithUser(db, post_id);
      const projectUsers = await PostsService.getAllProjectUsers(
        db,
        resultingPost.project_id
      );

      projectUsers.forEach(user => {
        let connected = WebSocketClients.getClient(user.username);
        if (connected) {
          connected.ws.send(
            JSON.stringify({
              messageType: 'post-patch',
              content: PostsService.serializePost(
                resultingPost,
                connected.username
              )
            })
          );
        }
      });

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

module.exports = postsRouter;
