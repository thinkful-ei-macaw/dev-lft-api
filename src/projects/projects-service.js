const xss = require('xss');

const REGEX_ALPHA_NUMBERS_AND_HYPHENS_UNDERSCORE_SPACE = /^[\w]+([-_\s]{1}[a-z0-9]+)*$/i;
const REGEX_URL_SIMPLE = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'*+,;=.]+$/;

const ProjectsService = {
  validateName(name) {
    name = name.toString();
    if (name.length < 2) {
      return 'must be 2 or more characters';
    }

    if (name.length > 30) {
      return 'must be less than 30 characters';
    }

    if (!REGEX_ALPHA_NUMBERS_AND_HYPHENS_UNDERSCORE_SPACE.test(name)) {
      return 'must contain only alphabetic characters or numbers and only 1 hyphen, underscore or space between them';
    }
  },
  validateProjectDescription(desc) {
    desc = desc.toString();
    if (desc.length < 10) {
      return 'must be 10 or more characters';
    }

    if (desc.length > 255) {
      return 'must be 255 characters or less';
    }
  },
  getAllWithVacancies(db) {
    return db
      .raw(
        `
        SELECT * FROM (
          SELECT DISTINCT ON (p.id)
        p.id,
        p.name,
        p.creator_id,
        p.description,
        p.tags,
        p.live_url,
        p.trello_url,
        p.github_url,
        p.date_created,
        p.handle 
      FROM
        projects p 
        INNER JOIN
          vacancies v 
          ON v.project_id = p.id 
      WHERE
        v.user_id IS NULL
        ) t ORDER BY date_created DESC;
      `
      )
      .then(results => results.rows);
  },
  getAllUserProjects(db, id) {
    return db
      .raw(
        `
      SELECT
        p.id,
        p.name,
        p.creator_id,
        p.description,
        p.tags,
        p.live_url,
        p.trello_url,
        p.github_url,
        p.date_created,
        p.handle 
      FROM
        projects p 
      WHERE
        p.creator_id = ? 
      UNION
      SELECT
        p.id,
        p.name,
        p.creator_id,
        p.description,
        p.tags,
        p.live_url,
        p.trello_url,
        p.github_url,
        p.date_created,
        p.handle 
      FROM
        projects p 
        INNER JOIN
            vacancies v 
            ON v.project_id = p.id 
      WHERE
        v.user_id = ?;
      `,
        [id, id]
      )
      .then(result => result.rows);
  },
  getProjectById(db, id) {
    return db('projects').where({ id }).first();
  },
  getProjectByHandle(db, handle) {
    return db('projects')
      .where({ handle })
      .join('users', 'users.id', 'projects.creator_id')
      .select(
        'projects.*',
        'users.first_name',
        'users.last_name',
        'users.username'
      )
      .first();
  },
  doesHandleExist(db, handle) {
    return db('projects').where({ handle }).first();
  },
  insertNewProject(db, newProject) {
    return db('projects')
      .insert(newProject)
      .returning('*')
      .then(([project]) => project)
      .then(project => ProjectsService.getProjectById(db, project.id));
  },
  updateProject(db, id, updatedProject) {
    return db('projects')
      .where({ id })
      .update(updatedProject)
      .then(rowsAffected => rowsAffected[0]);
  },
  getOpenCount(db, project_id) {
    return db
      .raw(
        `
      SELECT count(*) FROM vacancies WHERE project_id = ? AND user_id IS NULL;
      `,
        [project_id]
      )
      .then(result => result.rows);
  },

  deleteProject(db, id) {
    return db('projects').where({ id }).del();
  },

  validateURL(url) {
    if (!REGEX_URL_SIMPLE.test(url)) {
      return 'is an invalid URL';
    }
  },

  serializeProject(project) {
    const serialized = {
      vacancies: project.vacancies,
      id: project.id,
      name: xss(project.name),
      description: xss(project.description),
      tags: project.tags,
      live_url: project.live_url,
      trello_url: project.trello_url,
      github_url: project.github_url,
      date_created: project.date_created,
      userRole: project.userRole,
      handle: project.handle,
      openVacancies: project.openVacancies
    };

    if (project.username) {
      serialized['project_creator'] = {
        first_name: project.first_name,
        last_name: project.last_name,
        username: project.username
      };
    }

    return serialized;
  }
};

module.exports = ProjectsService;
