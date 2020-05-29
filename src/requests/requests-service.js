const Service = require('../base-service');

class RequestsService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  getRequests(db, project_id) {
    return super
      .getItemsWhere(db, { project_id })
      .join('users', { 'users.id': 'requests.user_id' });
  }

  serializeRequest(request) {
    const { id, vacancy_id, user_id, status, project_id, first_name, last_name } = request;
    return {
      id,
      vacancy_id,
      user_id,
      status,
      project_id,
      first_name,
      last_name
    }
  }
}

module.exports = new RequestsService('requests');