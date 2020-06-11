const express = require('express');
const NotificationsService = require('./notifications-service');
const notificationsRouter = express.Router();
const { requireAuth } = require('../middleware/jwt-auth');

notificationsRouter.use(requireAuth);

notificationsRouter
  .route('/')
  .get(async (req, res, next) => {
    const db = req.app.get('db');
    const recipient_id = req.user.id;

    try {
      let notifications = await NotificationsService.getNotifications(
        db,
        recipient_id
      );
      notifications = notifications.map(
        NotificationsService.serializeNotifications
      );
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  })

  .patch(async (req, res, next) => {
    const db = req.app.get('db');
    const user_id = { recipient_id: req.user.id };
    const data = { seen: true };
    try {
      await NotificationsService.updateItemsWhere(db, user_id, data);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

module.exports = notificationsRouter;
