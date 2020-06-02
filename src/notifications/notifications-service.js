const NotificationsService = {
  getAllNotifications(knex, recipient_id) {
    return knex
      .from('notifications')
      .select('*')
      .orderBy('date_created')
      .where({ recipient_id });
  },
  updateNotification(knex, id, notification) {
    return knex.from('notifications').where({ id }).update(notification);
  },
  getNotificationById(knex, id) {
    return knex.from('notifications').select('*').where({ id }).first();
  },
  insertNotification(knex, notification) {
    return knex
      .insert(notification)
      .into('notifications')
      .returning('*')
      .then(rows => rows[0]);
  }
};

module.exports = NotificationsService;
