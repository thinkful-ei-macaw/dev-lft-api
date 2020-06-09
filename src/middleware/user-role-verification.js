async function requireOwner(req, res, next) {
  const is_creator = await isProjectCreator(req);
  if (!is_creator) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  req.user.role = 'owner';
  next();
}

async function requireMember(req, res, next) {
  const is_creator = await isProjectCreator(req);
  const is_member = await isProjectMember(req);
  if (!is_creator && !is_member) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  req.user.role = is_creator ? 'owner' : 'member';
  next();
}

async function isProjectCreator(req) {
  const project_id = await findProjectId(req);
  const db = req.app.get('db');
  const project = await db
    .from('projects')
    .select('*')
    .where({ id: project_id })
    .first();
  return project.creator_id === req.user.id;
}

async function isProjectMember(req) {
  const project_id = await findProjectId(req);
  const db = req.app.get('db');
  const positions = await db
    .from('vacancies')
    .select('*')
    .where({ project_id, user_id: req.user.id });
  return !!positions.length;
}

async function findProjectId(req) {
  if (req.params.project_id) {
    return req.params.project_id;
  } else {
    const tableName = req.baseUrl.substr(req.baseUrl.lastIndexOf('/') + 1);
    const db = req.app.get('db');
    if (tableName !== 'requests') {
      const item = await db
        .from(tableName)
        .select('*')
        .where({ id: +req.params.id })
        .first();
      return item.project_id;
    } else {
      const request = await db
        .from(tableName)
        .select('*')
        .where({ id: +req.params.id })
        .first();

      const item = await db
        .from('vacancies')
        .select('*')
        .where({ id: +request.vacancy_id })
        .first();

      return item.project_id;
    }
  }
}

module.exports = {
  requireOwner,
  requireMember
};
