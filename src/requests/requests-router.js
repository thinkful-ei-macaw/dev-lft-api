const express = require('express');
const Service = require('../base-service');
const { requireAuth } = require('../middleware/jwt-auth');

const ProjectsService = require('../projects/projects-service');
const RequestsService = new Service('requests');

/**
 * Router to handle all requests to /api/requests
 */
const requestsRouter = express.Router();
requestsRouter.use(express.json());

// POST `/requests` creates a new request
requestsRouter.post('/:vacancy_id', requireAuth, (req, res, next) => {
  const db = req.app.get('db');
  const { project_id } = req.body;
  const { vacancy_id } = req.params;
  const user_id = req.user.id;

  // check if a project id is provided
  if (!project_id) {
    return res.status(400).json({
      error: `Missing 'project_id' in request body`
    })
  }

  // check if request by user already exists for given vacancy
  RequestsService.getAllItems(db)
    .then(requests => {

      console.log(requests.filter(r => r.user_id === user_id && r.vacancy_id == vacancy_id));

      // check the requests for the vacancy and user id
      // if one exists, user already requested to join the team
      if (requests.filter(request => request.user_id === user_id && request.vacancy_id === vacancy_id).length)
        return res.status(400).json({
          error: `Request for same vacancy by this user already exists`
        });

      // otherwise, create it
      const newRequest = {
        vacancy_id,
        project_id,
        user_id,
        date_created: 'now()'
      }

      // store the request data
      RequestsService.insertItem(db, newRequest)
        .then(request => {

          // send 'em back the request
          return res.status(201).json(request);

        })
        .catch(next);

    })
    .catch(next);

});

// PATCH `/requests/:request_id` marks a request as approved or denied
requestsRouter.patch('/:request_id', requireAuth, (req, res, next) => {
  const db = req.app.get('db');
  const { request_id } = req.params;
  const { status } = req.body;
  const updatedRequest = { status };

  const numberOfValues = Object.values(updatedRequest).filter(Boolean).length;
  if (numberOfValues === 0)
    return res.status(400).json({
      error: 'Request body must contain status'
    });

  RequestsService.getItemById(db, request_id)
    .then(request => {

      // 404 if request doesn't exist
      if (!request)
        return res.status(404).json({
          error: 'Request not found'
        });

      // update the request
      RequestsService.updateItem(db, request_id, updatedRequest)
        .then(() => {
          return res.status(204).end();
        })
        .catch(next);

    })
    .catch(next);

});

// GET `/requests/:project_id` gets all requests for a specific project
requestsRouter.get('/:project_id', requireAuth, (req, res, next) => {
  const db = req.app.get('db');
  const { project_id } = req.params;

  // check if project exists
  ProjectsService.getProjectById(db, project_id)
    .then(project => {

      // 404 if no project
      if (!project)
        return res.status(404).json({
          error: 'Project not found'
        });

      // send 'em a list
      RequestsService.getAllItems(db)
        .then(requests => {

          // get only requests with matching project id
          const projectRequests = requests.filter(request => request.project_id === project_id);

          return res.status(200).json(projectRequests);

        })

    })

});

module.exports = requestsRouter;