const xss = require('xss');
const VacancyService = {
  getAllVacancies(knex, project_id) {
    return knex
      .from('vacancies')
      .select('*')
      .where({ project_id })
      .orderBy('date_created', 'description');
  },
  insertVacancy(knex, role) {
    return knex
      .insert(role)
      .into('vacancies')
      .returning('*')
      .then(rows => rows[0]);
  },
  updateVacancy(knex, id, vacancy) {
    return knex('vacancies').where({ id }).update(vacancy);
  },
  deleteVacancy(knex, id) {
    return knex('vacancies').where({ id }).del();
  },
  getVacancyById(knex, id) {
    return knex.from('vacancies').select('*').where({ id }).first();
  },
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

module.exports = VacancyService;
