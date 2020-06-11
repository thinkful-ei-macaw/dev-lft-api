const Service = require('../base-service');

class NotificationsService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  getNotifications(db, recipient_id) {
    return super
      .getItemsWhere(db, { recipient_id, seen: false })
      .select('notifications.*', 'projects.name', 'projects.handle')
      .join('projects', 'notifications.project_id', 'projects.id')
  }

  findProjectUsers(db, project_id, user_id, notification_type) {
    return db.raw(`
      SELECT DISTINCT u.id FROM projects p 
      INNER JOIN vacancies v on v.project_id = p.id 
      INNER JOIN users u on (u.id = v.user_id or p.creator_id = u.id)
      WHERE p.id = ? AND u.id != ? AND ? = ANY(u.notifications);
    `, [project_id, user_id, notification_type])
      .then(result => result.rows);
  }

  findProjectId(db, request_id) {
    return db.raw(`
      SELECT v.project_id FROM requests r
      INNER JOIN vacancies v on r.vacancy_id = v.id
      WHERE r.id = ?
      LIMIT 1;
    `, [request_id])
      .then(result => result.rows[0].project_id);
  }

  insertNotifications(db, recipients, type, project_id) {
    let notifications = recipients.map(recipient => {
      return {
        recipient_id: recipient.id,
        project_id,
        type
      }
    });

    return super.insertItems(db, notifications);
  }

  serializeNotifications(notification) {
    return {
      type: notification.type,
      seen: notification.seen,
      date_created: notification.date_created,
      handle: notification.handle,
      name: notification.name
    }
  }
}

module.exports = new NotificationsService('notifications');