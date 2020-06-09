const xss = require('xss');
const Service = require('../base-service');
const REGEX_APLHA_NUMBERS_HYPHENS_UNDERSCORES_AND_SPACES = /^[A-Za-z0-9_/-\s]+$/;

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
      title: xss(vacancy.title),
      description: xss(vacancy.description),
      skills: vacancy.skills
    };
  }

  validateTitle(title) {
    title = title.toString();
    if (title.length < 2) {
      return 'must be 2 or more characters';
    }

    if (title.length > 30) {
      return 'must be less than 30 characters';
    }

    if (!REGEX_APLHA_NUMBERS_HYPHENS_UNDERSCORES_AND_SPACES.test(title)) {
      return 'must contain only letters, numbers, hyphens, and underscores or spaces';
    }
  }

  validateDescription(description) {
    description = description.toString();
    if (description.length < 10) {
      return 'must be 10 or more characters';
    }

    if (description.length > 255) {
      return 'must be less than 255 characters';
    }
  }

  validateSkills(skills) {
    skills = skills.toString();
    if (skills.length < 2) {
      return 'must be 2 or more characters';
    }

    if (skills.length > 30) {
      return 'must be less than 30 characters';
    }
  }

  validateTags(tags) {
    if (tags.length > 10) {
      return 'must be no more than 10 skills';
    }
  }

  validateTagLength(tags) {
    tags = tags.toString();
    if (tags.length < 3) {
      return 'must be at least 3 characters';
    }

    if (tags.length > 30) {
      return 'must be no more than 30 characters';
    }
  }
}

module.exports = new VacancyService('vacancies');
