const express = require('express');
const NotificationsService = require('./notifications-service');
const notificationsRouter = express.Router();
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');

notificationsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const notifications = await NotificationsService.getAllNotifications(
      req.app.get('db'),
      req.user.id
    );
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
});

notificationsRouter
  .route('/:notification_id')
  .patch(requireAuth, jsonParser, async (req, res, next) => {
    try {
      const { seen } = req.body;
      const { notification_id } = req.params;
      const newNotification = { seen };

      if (seen === undefined)
        return res.status(400).json({
          error: `Request body must contain 'seen'`
        });

      const notification = await NotificationsService.getNotificationById(
        req.app.get('db'),
        notification_id
      );
      if (!notification) {
        return res.status(404).json({ error: 'Notification does not exist' });
      }

      await NotificationsService.updateNotification(
        req.app.get('db'),
        notification_id,
        newNotification
      );
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

module.exports = notificationsRouter;
