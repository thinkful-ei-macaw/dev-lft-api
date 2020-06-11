const express = require('express');
const NotificationsService = require('./notifications-service');

const notificationsRouter = express.Router();
const bodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');

notificationsRouter.use(requireAuth);

notificationsRouter.route('/').get(async (req, res, next) => {
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
});

notificationsRouter
  .route('/:notification_id')
  .patch(bodyParser, async (req, res, next) => {
    const db = req.app.get('db');

    try {
      const { seen } = req.body;
      const { notification_id } = req.params;
      const newNotification = { seen };

      if (seen === undefined)
        return res.status(400).json({
          error: `Request body must contain 'seen'`
        });

      if (seen !== true && seen !== false)
        return res.status(400).json({
          error: `Seen must be 'true' or 'false'`
        });

      const notification = await NotificationsService.getItemById(
        db,
        notification_id
      );
      if (!notification)
        return res.status(404).json({ error: 'Notification does not exist' });

      await NotificationsService.updateItem(
        db,
        notification_id,
        newNotification
      );
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

module.exports = notificationsRouter;
