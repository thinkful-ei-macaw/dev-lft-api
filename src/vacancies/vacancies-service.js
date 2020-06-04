const xss = require('xss');
const Service = require('../base-service');

class VacancyService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  getVacancies(db, project_id, user_id) {
    return db
      .raw(
        `
      SELECT 
      v.id, 
      v.project_id, 
      u.first_name, 
      u.last_name, 
      u.username, 
      v.title, 
      v.description, 
      v.skills, 
      r.status 
      FROM vacancies v
      LEFT JOIN requests r ON r.user_id = ? AND r.vacancy_id = v.id
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.project_id = ?
      `,
        [user_id, project_id]
      )
      .then(result => result.rows);
  }

  // Helps us find out if a user is part of the project
  findFilledVacancy(db, project_id, user_id) {
    return db
      .raw(
        `
      SELECT * FROM vacancies v
      WHERE project_id = ?
      AND user_id = ?
      LIMIT 1
    `,
        [project_id, user_id]
      )
      .then(result => result.rows);
  }

  serializeVacancy(vacancy) {
    return {
      id: vacancy.id,
      project_id: vacancy.project_id,
      request_status: vacancy.status,
      first_name: vacancy.first_name,
      last_name: vacancy.last_name,
      username: vacancy.username,
      title: vacancy.title,
      description: xss(vacancy.description),
      skills: vacancy.skills
    };
  }
}

module.exports = new VacancyService('vacancies');
