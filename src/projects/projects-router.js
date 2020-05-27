const express = require('express');
const ProjectsService = require('./projects-service');

const projectsRouter = express.Router();
const bodyParser = express.json();

projectsRouter
  .route('/')
  .get(async (req, res, next) => {
    try {
      const allWithVacancies = await ProjectsService.getAllWithVacancies(
        req.app.get('db')
      );

      res.json(allWithVacancies);
    } catch (e) {
      next(e);
    }
  })
  .post(bodyParser, async (req, res, next) => {
    const {
      name,
      description,
      tags,
      live_url,
      trello_url,
      github_url
    } = req.body;

    const creator_id = req.user.id;

    const requiredFields = {
      name,
      description,
      creator_id
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null) {
        return res
          .status(400)
          .json({ error: `Missing '${key}' in request body` });
      }
    }

    const newProject = {
      ...requiredFields,
      tags,
      live_url,
      trello_url,
      github_url
    };

    try {
      const createdProject = await ProjectsService.insertNewProject(
        req.app.get('db'),
        newProject
      );

      res.status(201).json({ createdProject });
    } catch (e) {
      next(e);
    }
  });

projectsRouter.route('/:user_id').get(async (req, res, next) => {
  const { user_id } = req.params;

  try {
    const allUserProjects = await ProjectsService.getAllUserProjects(
      req.app.get('db'),
      user_id
    );

    if (!allUserProjects) {
      return res
        .status(404)
        .json({ error: `No projects found for user with id ${user_id}` });
    }

    res.json(allUserProjects);
  } catch (e) {
    next(e);
  }
});

projectsRouter
  .route('/:project_id')
  .patch(bodyParser, async (req, res, next) => {
    const {
      name,
      description,
      tags,
      live_url,
      trello_url,
      github_url
    } = req.body;

    const { project_id } = req.params;

    // TODO: Check that user is authorized to modify the project
    // req.user.id should match creator_id in projects table
    // const creator_id = req.user.id;

    const requiredFields = {
      name,
      description
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null) {
        return res
          .status(400)
          .json({ error: `Missing '${key}' in request body` });
      }
    }

    const updatedProject = {
      ...requiredFields,
      tags,
      live_url,
      trello_url,
      github_url
    };

    try {
      await ProjectsService.updateProject(
        req.app.get('db'),
        project_id,
        updatedProject
      );

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  })
  .delete(async (req, res, next) => {
    const { project_id } = req.params;

    // TODO: Check that user is authorized to delete the project
    // req.user.id should match creator_id in projects table
    // const creator_id = req.user.id;

    try {
      await ProjectsService.deleteProject(req.app.get('db'), project_id);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

module.exports = projectsRouter;
