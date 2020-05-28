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
  }
};

module.exports = VacancyService;
