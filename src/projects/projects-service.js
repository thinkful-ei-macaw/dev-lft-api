const xss = require('xss');

const ProjectsService = {
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
        p.date_created 
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
        p.date_created 
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
        p.date_created 
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
  deleteProject(db, id) {
    return db('projects').where({ id }).del();
  },
  serializeProject(project) {
    return {
      id: project.id,
      name: project.name,
      creator: project.creator_id,
      description: xss(project.description),
      tags: project.tags,
      live_url: project.live_url,
      trello_url: project.trello_url,
      github_url: project.github_url,
      date_created: project.date_created 
    };
  }
};

module.exports = ProjectsService;
