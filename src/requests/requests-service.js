const Service = require('../base-service');

class RequestsService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  getRequests(db, project_id) {
    return super
      .getItemsWhere(db, { project_id: project_id })
      .select(
        'requests.*',
        'users.first_name',
        'users.last_name',
        'users.username',
        'vacancies.title',
        'vacancies.project_id'
      )
      .join('users', { 'users.id': 'requests.user_id' })
      .join('vacancies', { 'vacancies.id': 'requests.vacancy_id' });
  }

  serializeRequest(request) {
    return {
      id: request.id,
      vacancy_id: request.vacancy_id,
      vacancy_title: request.title,
      username: request.username,
      status: request.status,
      project_id: request.project_id,
      first_name: request.first_name,
      last_name: request.last_name
    };
  }
}

module.exports = new RequestsService('requests');
