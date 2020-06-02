const xss = require('xss');
const Service = require('../base-service');

class VacancyService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  getVacancies(db, project_id) {
    return super
      .getItemsWhere(db, { project_id })
      .select('vacancies.*', 'users.first_name', 'users.last_name')
      .leftJoin('users', { 'users.id': 'vacancies.user_id' });
  }

  serializeVacancy(vacancy) {
    return {
      id: vacancy.id,
      project_id: vacancy.project_id,
      user_id: vacancy.user_id,
      first_name: vacancy.first_name,
      last_name: vacancy.last_name,
      title: vacancy.title,
      description: xss(vacancy.description),
      skills: vacancy.skills
    };
  }
}

module.exports = new VacancyService('vacancies');
