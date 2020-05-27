const VacancyService = {
    getAllVacancies(knex, id) {
        return knex.from('vacancies').select("*").where({project_id: id}).orderBy('id')
    },
    insertVacancy(knex, role) {
        return knex.insert(role)
            .into('vacancies')
            .returning("*")
            .then(rows => 
                rows[0]
            )
    },
    updateVacancy(knex, id, vacancy) {
        return knex('vacancies').where({id}).update(vacancy)
    },
    deleteVacancy(knex, id) {
        return knex('vacancies').where({id}).delete()
    }
}

module.exports = VacancyService