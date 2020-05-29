const Service = require('../base-service');

class RequestsService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  getRequests(db, project_id) {
    return super
      .getItemsWhere(db, { 'requests.project_id': project_id, status: 'pending' })
      .select('requests.*', 'users.*', 'vacancies.title')
      .join('users', { 'users.id': 'requests.user_id' })
      .join('vacancies', { 'vacancies.id': 'requests.vacancy_id' });
  }

  serializeRequest(request) {
    return {
      id: request.id,
      vacancy_id: request.vacancy_id,
      vacancy_title: request.title,
      user_id: request.user_id,
      status: request.status,
      project_id: request.project_id,
      first_name: request.first_name,
      last_name: request.last_name
    }
  }
}

module.exports = new RequestsService('requests');