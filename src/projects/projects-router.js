const express = require('express');
const ProjectsService = require('./projects-service');
const VacanciesService = require('../vacancies/vacancies-service');
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

      let vacancies = allWithVacancies.map(async project => {
        let openCount = await ProjectsService.getOpenCount(
          req.app.get('db'),
          project.id
        );
        let openVacancies = openCount[0].count;
        return { ...project, openVacancies };
      });

      const allWithVacanciesWithCount = await Promise.all(vacancies);

      res
        .status(200)
        .json(allWithVacanciesWithCount.map(ProjectsService.serializeProject));
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

    for (const url of ['live_url', 'trello_url', 'github_url']) {
      if (req.body[url]) {
        const urlError = ProjectsService.validateURL(req.body[url]);
        if (urlError)
          return res
            .status(400)
            .json({ error: `${req.body[url]} ${urlError}` });
      }
    }

    let handle = name
      .replace(/\s+/g, '-')
      .replace(/[^A-Za-z0-9-]/g, '')
      .toLowerCase();

    async function checkHandle(handle) {
      const doesHandleExist = await ProjectsService.doesHandleExist(
        req.app.get('db'),
        handle
      );

      if (!doesHandleExist) {
        return handle;
      } else {
        handle = handle + Math.floor(Math.random() * 100);
        return checkHandle(handle);
      }
    }

    const handleOK = await checkHandle(handle);

    const newProject = {
      ...requiredFields,
      tags,
      live_url,
      trello_url,
      github_url,
      handle: handleOK
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
      let allUserProjects = await ProjectsService.getAllUserProjects(
        req.app.get('db'),
        user_id
      );

      if (!allUserProjects) {
        return res
          .status(404)
          .json({ error: `No projects found for user with id ${user_id}` });
      }

      let vacancies = allUserProjects.map(async project => {
        let openCount = await ProjectsService.getOpenCount(
          req.app.get('db'),
          project.id
        );
        let openVacancies = openCount[0].count;
        return { ...project, openVacancies };
      });

      const allUserProjectsWithCount = await Promise.all(vacancies);

      return res
        .status(200)
        .json(allUserProjectsWithCount.map(ProjectsService.serializeProject));
    } catch (e) {
      next(e);
    }
  });

projectsRouter
  .route('/:project_handle')
  .all(requireAuth)
  .get(async (req, res, next) => {
    const { project_handle } = req.params;
    const user_id = req.user.id;

    try {
      const project = await ProjectsService.getProjectByHandle(
        req.app.get('db'),
        project_handle
      );

      if (!project) {
        return res
          .status(404)
          .json({ error: `No project found with handle ${project_handle}` });
      }

      /* Set property on project response that lets client know 
      if the user is the owner of this project */
      const vacancy = await VacanciesService.findFilledVacancy(
        req.app.get('db'),
        project.id,
        user_id
      );
      if (user_id === project.creator_id) {
        project.userRole = 'owner';
      } else if (vacancy.length) {
        project.userRole = 'member';
      } else {
        project.userRole = 'user';
      }
      let openCount = await ProjectsService.getOpenCount(
        req.app.get('db'),
        project.id
      );

      project.openVacancies = await openCount[0].count;

      res.status(200).json(ProjectsService.serializeProject(project));
    } catch (e) {
      next(e);
    }
  });

projectsRouter
  .route('/:project_id')
  .all(requireAuth)
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
