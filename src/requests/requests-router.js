const express = require('express');
const VacanciesService = require('../vacancies/vacancies-service');
const RequestsService = require('./requests-service');
const { requireAuth } = require('../middleware/jwt-auth');
const { requireOwner } = require('../middleware/user-role-verification');


const requestsRouter = express.Router();
const bodyParser = express.json();

requestsRouter.use(requireAuth);

// POST `/requests` creates a new request
requestsRouter
  .route('/:vacancy_id')
  .post(async (req, res, next) => {
    const db = req.app.get('db');
    const { vacancy_id } = req.params;
    const user_id = req.user.id;

    try {
      // check if request by user already exists for given vacancy
      const request = await RequestsService.getItemWhere(db, { user_id, vacancy_id });

      // if one exists, user already requested to join the team
      if (request)
        return res.status(400).json({
          error: `Request for same vacancy by this user already exists`
        });

      // otherwise, create it
      const newRequest = {
        vacancy_id,
        user_id,
        date_created: 'now()'
      };

      // store the request data
      const dbRequest = await RequestsService.insertItem(db, newRequest);

      // send 'em back the request
      return res.status(201).json(dbRequest);

    } catch (error) {
      next(error);
    }
  });

// PATCH `/requests/:request_id` marks a request as approved or denied
requestsRouter
  .route('/:id')
  .patch(bodyParser, requireOwner, async (req, res, next) => {
    const db = req.app.get('db');
    const request_id = req.params.id;
    const { status } = req.body;

    try {

      // check that a status was provided
      if (!status)
        return res.status(400).json({
          error: 'Request body must contain status'
        });

      const updatedRequest = { status: status.toLowerCase() };

      // check the validity of the status provided
      if (
        updatedRequest.status !== 'approved' &&
        updatedRequest.status !== 'denied'
      ) {
        return res.status(400).send({
          error: `Status must be either 'approved' or 'denied'`
        });
      }

      // update the request
      const request = await RequestsService.updateItem(db, request_id, updatedRequest)
      if (!request) return;

      // if the status was approved
      if (status === 'approved') {

        // put the user into the vacancy
        const { user_id, vacancy_id } = request;
        const updatedVacancy = { user_id };
        await VacanciesService.updateItem(db, vacancy_id, updatedVacancy);

        // deny all other requests for the same vacancy
        const deniedRequest = { status: 'denied' };
        await RequestsService.updateItemsWhere(db, { vacancy_id }, deniedRequest).whereNot({ id: request.id });
      }

      // send 'em back a thing
      return res.status(204).end();

    } catch (error) {
      next(error);
    }
  });

// GET `/requests/:project_id` gets all requests for a specific project
requestsRouter
  .route('/:project_id')
  .get(requireOwner, async (req, res, next) => {
    const db = req.app.get('db');
    const { project_id } = req.params;

    try {
      // send 'em a list
      const requests = await RequestsService.getRequests(db, project_id)
      if (res.headersSent) return; // just in case requireOwner had an issue with this

      return res
        .status(200)
        .json(requests.map(RequestsService.serializeRequest));

    } catch (error) {
      next(error);
    }
  });

module.exports = requestsRouter;
