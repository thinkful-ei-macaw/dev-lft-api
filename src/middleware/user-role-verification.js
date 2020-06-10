async function requireOwner(req, res, next) {
  const is_creator = await isProjectCreator(req, res);
  if (!is_creator && !res.headersSent) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  req.user.role = 'owner';
  next();
}

async function requireMember(req, res, next) {
  const is_creator = await isProjectCreator(req, res);
  const is_member = await isProjectMember(req, res);
  if (!is_creator && !is_member && !res.headersSent) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  req.user.role = is_creator ? 'owner' : 'member';
  next();
}

async function isProjectCreator(req, res) {
  const { creator_id } = await findProjectId(req, res);
  return creator_id === req.user.id;
}

async function isProjectMember(req, res) {
  const { project_id } = await findProjectId(req, res);
  if (!project_id && !res.headersSent) {
    return res.status(404).json({
      error: 'Vacancy not found'
    });
  }

  const db = req.app.get('db');
  const positions = await db
    .from('vacancies')
    .select('*')
    .where({ project_id, user_id: req.user.id });
  return !!positions.length;
}

async function findProjectId(req, res) {
  let project_id = null;
  const db = req.app.get('db');
  if (req.params.project_id) {
    project_id = req.params.project_id;
  } else {
    const tableName = req.baseUrl.substr(req.baseUrl.lastIndexOf('/') + 1);

    if (tableName !== 'requests') {
      const item = await db
        .from(tableName)
        .select('*')
        .where({ id: +req.params.id })
        .first();
      if (!item) {
        if (!res.headersSent)
          return res.status(404).json({
            error: 'Vacancy not found'
          });

        return { project_id: null }
      }

      project_id = item.project_id;
    } else {
      const request = await db
        .from(tableName)
        .select('*')
        .where({ id: +req.params.id })
        .first();
      if (!request) {
        return res.status(404).json({
          error: 'Request not found'
        });
      }

      const item = await db
        .from('vacancies')
        .select('*')
        .where({ id: +request.vacancy_id })
        .first();
      if (!item) {
        return res.status(404).json({
          error: 'Vacancy not found'
        });
      }

      project_id = item.project_id;
    }
  }
  // verify project exists
  const project = await db
    .from('projects')
    .select('*')
    .where({ id: project_id })
    .first();
  if (!project) return res.status(404).json({ error: `Project not found` });
  return { project_id: project.id, creator_id: project.creator_id };
}

module.exports = {
  requireOwner,
  requireMember
};
