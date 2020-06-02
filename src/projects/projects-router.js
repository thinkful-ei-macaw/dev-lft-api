const express = require('express');
const ProjectsService = require('./projects-service');
const { requireAuth } = require('../middleware/jwt-auth');

const projectsRouter = express.Router();
const bodyParser = express.json();

projectsRouter
  .route('/')
  .get(async (req, res, next) => {
    try {
      const allWithVacancies = await ProjectsService.getAllWithVacancies(
        req.app.get('db')
      );
      res
        .status(200)
        .json(allWithVacancies.map(ProjectsService.serializeProject));
    } catch (e) {
      next(e);
    }
  })
  .post(requireAuth, bodyParser, async (req, res, next) => {
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

      res.status(201).json(ProjectsService.serializeProject(createdProject));
    } catch (e) {
      next(e);
    }
  });

projectsRouter
  .route('/user')
  .all(requireAuth)
  .get(async (req, res, next) => {
    const user_id = req.user.id;

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

      return res
        .status(200)
        .json(allUserProjects.map(ProjectsService.serializeProject));
    } catch (e) {
      next(e);
    }
  });

projectsRouter
  .route('/:project_id')
  .all(requireAuth)
  .get(async (req, res, next) => {
    const { project_id } = req.params;
    const user_id = req.user.id;

    try {
      const project = await ProjectsService.getProjectById(
        req.app.get('db'),
        project_id
      );

      if (!project) {
        return res
          .status(404)
          .json({ error: `No project found with id ${project_id}` });
      }

      /* Set property on project response that lets client know 
      if the user is the owner of this project */
      project.isOwner = user_id === project.creator_id;

      res.status(200).json(ProjectsService.serializeProject(project));
    } catch (e) {
      next(e);
    }
  })
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

    // Check the the currently auth user
    // is the one who created this post
    const creator_id = req.user.id;

    try {
      const project = await ProjectsService.getProjectById(
        req.app.get('db'),
        project_id
      );

      // First make sure project with this id exists
      if (!project) {
        return res.status(404).json({ error: `No project found with that id` });
      }

      // Make sure this is their project
      if (project.creator_id !== creator_id) {
        return res.status(401).json({ error: 'Unauthorized request' });
      }
    } catch (e) {
      next(e);
    }

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

    // We will the the currently auth user
    // is the one who created this post
    const creator_id = req.user.id;

    try {
      const project = await ProjectsService.getProjectById(
        req.app.get('db'),
        project_id
      );

      // First make sure a project with this id exists
      if (!project) {
        return res.status(404).json({ error: `No project found with that id` });
      }

      // Make sure this is their project
      if (project.creator_id !== creator_id) {
        return res.status(401).json({ error: 'Unauthorized request' });
      }
    } catch (e) {
      next(e);
    }

    try {
      await ProjectsService.deleteProject(req.app.get('db'), project_id);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

module.exports = projectsRouter;
