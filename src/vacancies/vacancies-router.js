const express = require('express');
const RequestsService = require('../requests/requests-service');
const VacancyService = require('./vacancies-service');
const vacancyRouter = express.Router();
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');

vacancyRouter.get('/:project_id', requireAuth, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { project_id } = req.params;
    const user_id = req.user.id;
    const vacancies = await VacancyService.getVacancies(
      db,
      project_id,
      user_id
    );
    res.status(200).json(vacancies.map(VacancyService.serializeVacancy));
  } catch (error) {
    next(error);
  }
});

vacancyRouter
  .route('/:project_id')
  .post(requireAuth, jsonParser, async (req, res, next) => {
    try {
      const db = req.app.get('db');
      const { title, description, skills } = req.body;
      const { project_id } = req.params;
      const newVacancy = {
        title,
        description,
        skills,
        project_id
      };

      const requiredFields = ['title', 'description'];

      for (const field of requiredFields)
        if (!req.body[field])
          return res.status(400).json({
            error: `Missing '${field}' in request body`
          });

      const vacancy = await VacancyService.insertItem(db, newVacancy);
      res.status(201).json(VacancyService.serializeVacancy(vacancy));
    } catch (error) {
      next(error);
    }
  });

vacancyRouter
  .route('/:vacancy_id')
  .patch(requireAuth, jsonParser, async (req, res, next) => {
    try {
      const db = req.app.get('db');
      const { title, description, skills, user_id } = req.body;
      const { vacancy_id } = req.params;
      const newVacancy = {
        title,
        description,
        skills,
        user_id
      };

      const numVals = Object.values(newVacancy).filter(val => val !== undefined)
        .length;
      if (numVals === 0)
        return res.status(400).json({
          error: `Request body must contain at least one of 'title', 'description', 'skills', or 'user_id'`
        });

      const vacancy = await VacancyService.getItemById(db, vacancy_id);
      if (!vacancy) {
        return res.status(404).json({ error: 'Vacancy does not exist' });
      }

      // delete the request if the user_id is being set to null
      if (user_id === null) {
        // find the corresponding request
        const request = await RequestsService.getItemWhere(db, {
          vacancy_id,
          status: 'approved'
        });

        // delete it
        await RequestsService.deleteItem(db, request.id);
      }

      await VacancyService.updateItem(db, vacancy_id, newVacancy);

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

vacancyRouter
  .route('/:vacancy_id')
  .delete(requireAuth, async (req, res, next) => {
    try {
      const db = req.app.get('db');
      const { vacancy_id } = req.params;
      const vacancy = await VacancyService.getItemById(db, vacancy_id);

      if (!vacancy) {
        return res.status(404).json({ error: 'Vacancy does not exist' });
      }

      await VacancyService.deleteItem(db, vacancy_id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

module.exports = vacancyRouter;
