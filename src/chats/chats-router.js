const express = require('express');
const ChatsService = require('./chats-service');
const UsersService = require('../users/users-service');
const { requireAuth } = require('../middleware/jwt-auth');

const chatsRouter = express.Router();
const bodyParser = express.json();

chatsRouter.use(requireAuth);

chatsRouter
  .route('/')
  .post(bodyParser, async (req, res, next) => {
    const db = req.app.get('db');
    const author_id = req.user.id;
    const { recipient_username, request_id, body } = req.body;

    for (const [key, value] of Object.entries({
      recipient_username,
      request_id,
      body
    })) {
      if (!value) {
        return res
          .status(400)
          .json({ error: `Missing ${key} in request body` });
      }
    }

    try {
      // First, retrieve info for user we want to chat with
      const recipient = await UsersService.getItemWhere(db, {
        username: recipient_username
      });

      if (!recipient)
        return res.status(404).json({
          error: 'User not found'
        });

      /* Then, check to see if chat exists between users
      / for this project */
      const chat = await ChatsService.getChatByRequest(
        db,
        request_id,
        author_id,
        recipient.id
      );

      // If there is no pre-existing chat
      if (!chat) {
        // insert new chat AND message
        const newChat = {
          request_id,
          author_id,
          recipient_id: recipient.id
        };

        const resultingChat = await ChatsService.insertNewChat(db, newChat);

        const newMessage = {
          chat_id: resultingChat.id,
          author_id,
          body
        };

        const resultingMessage = await ChatsService.insertNewMessage(
          db,
          newMessage
        );

        return res.status(201).json({ resultingMessage });
      } else {
        // insert new message using pre-existing chat id
        const newMessage = {
          chat_id: chat.id,
          author_id,
          body
        };

        const resultingMessage = await ChatsService.insertNewMessage(
          db,
          newMessage
        );
        return res.status(201).json({ resultingMessage });
      }
    } catch (e) {
      next(e);
    }
  })
  .get(async (req, res, next) => {
    /* Gets the latest messages for each chat between you
    and another person */
    const user_id = req.user.id;
    try {
      let chats = await ChatsService.getLatestChatMessages(
        req.app.get('db'),
        user_id
      );
      chats = chats.map(ChatsService.serializeChat);
      return res.status(200).json(chats);
    } catch (e) {
      next(e);
    }
  });

chatsRouter
  .route('/:chat_id')
  .get(async (req, res, next) => {
    // Get all the messages from a specific chat
    const { chat_id } = req.params;
    const username = req.user.username;
    try {
      const allMessagesNoAuthorStatus = await ChatsService.getAllChatMessages(
        req.app.get('db'),
        chat_id
      );

      let allMessages = allMessagesNoAuthorStatus.map(msg => {
        return {
          ...msg,
          isAuthor: msg.author_username === username
        };
      });
      allMessages = allMessages.map(ChatsService.serializeMessage);
      return res.status(200).json({ allMessages });
    } catch (e) {
      next(e);
    }
  })
  .patch(bodyParser, async (req, res, next) => {
    /* Allows you to set the 'closed' status of the chat, 
    to disable it */
    let { closed } = req.body;
    const { chat_id } = req.params;
    const user_id = req.user.id;

    if (closed !== true && closed !== false) {
      return res
        .status(400)
        .json({ error: `Chat closed status must be either 'true' or 'false'` });
    }

    try {
      const currentChat = await ChatsService.getChatById(
        req.app.get('db'),
        chat_id
      );

      if (currentChat.author_id !== user_id) {
        return res.status(401).json({ error: `Unauthorized request.` });
      }

      await ChatsService.setChatClosed(req.app.get('db'), chat_id, closed);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

module.exports = chatsRouter;
