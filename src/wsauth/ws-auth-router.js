const express = require('express');
const WSAuthService = require('./ws-auth-service');
const { requireAuth } = require('../middleware/jwt-auth');

const wsAuthRouter = express.Router();

const WebSocketClients = require('../websocket-clients');

wsAuthRouter.route('/').get(requireAuth, async (req, res, next) => {
  // Get user info
  const { user } = req;
  const db = req.app.get('db');
  try {
    // Create a unique ticket based on the User. This will be stored temporarily
    // and the client must quickly request the WebSocket connection using this ticket.
    const ticket = `${
      user.username
    }+${new Date().toISOString()}+${user.date_created.toISOString()}`;

    const resultingTicket = await WSAuthService.insertItem(db, { ticket });

    // Delete the ticket after 5 seconds
    setTimeout(async () => {
      try {
        await WSAuthService.deleteItem(db, resultingTicket.id);
      } catch (error) {
        next(error);
      }
    }, 5000);

    // Return the ticket to the client
    return res.status(200).json({ ticket });
  } catch (error) {
    next(error);
  }
});

module.exports = wsAuthRouter;
