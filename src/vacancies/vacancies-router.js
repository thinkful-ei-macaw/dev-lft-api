const express = require('express');
const VacancyService = require('./vacancies-service');
const vacancyRouter = express.Router();
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');

vacancyRouter.get('/:project_id', requireAuth, async (req, res, next) => {
  try {
    const vacancies = await VacancyService.getAllVacancies(
      req.app.get('db'),
      req.params.project_id
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
      const { title, description, skills } = req.body;
      const newVacancy = {
        title,
        description,
        skills,
        project_id: req.params.project_id
      };

      const requiredFields = ['title', 'description'];

      for (const field of requiredFields)
        if (!req.body[field])
          return res.status(400).json({
            error: `Missing '${field}' in request body`
          });

      const vacant = await VacancyService.insertVacancy(
        req.app.get('db'),
        newVacancy
      );
      res.status(201).json(VacancyService.serializeVacancy(vacant));
    } catch (error) {
      next(error);
    }
  });

vacancyRouter
  .route('/:vacancy_id')
  .patch(requireAuth, jsonParser, async (req, res, next) => {
    try {
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

      const vacancy = await VacancyService.getVacancyById(
        req.app.get('db'),
        vacancy_id
      );
      if (!vacancy) {
        return res.status(404).json({ error: 'Vacancy does not exist' });
      }

      await VacancyService.updateVacancy(
        req.app.get('db'),
        vacancy_id,
        newVacancy
      );
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

vacancyRouter
  .route('/:vacancy_id')
  .delete(requireAuth, async (req, res, next) => {
    try {
      const { vacancy_id } = req.params;
      const vacancy = await VacancyService.getVacancyById(
        req.app.get('db'),
        vacancy_id
      );
      if (!vacancy) {
        return res.status(404).json({ error: 'Vacancy does not exist' });
      }
      await VacancyService.deleteVacancy(req.app.get('db'), vacancy_id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

module.exports = vacancyRouter;
