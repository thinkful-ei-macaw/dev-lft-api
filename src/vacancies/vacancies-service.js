const xss = require('xss');
const Service = require('../base-service');

class VacancyService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  serializeVacancy(vacancy) {
    return {
      id: vacancy.id,
      project_id: vacancy.project_id,
      user_id: vacancy.user_id,
      title: vacancy.title,
      description: xss(vacancy.description),
      skills: vacancy.skills
    };
  }
};

module.exports = new VacancyService('vacancies');
