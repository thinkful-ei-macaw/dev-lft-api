const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Vacancies Endpoints', () => {
  let db;

  let {
    testUsers,
    testProjects,
    testVacancies,
    testRequests,
    testPosts,
    testChats,
    testMessages,
    testNotifications
  } = helpers.makeFixtures();

  beforeEach('insert data', () => {
    return helpers.seedProjectsTables(
      db,
      testUsers,
      testProjects,
      testVacancies,
      testRequests,
      testPosts,
      testChats,
      testMessages,
      testNotifications
    );
  });

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('GET /api/vacancies/:project_id', () => {
    it('responds with 200 and the vacancies', () => {
      const testProject = testProjects[0];
      const testUser = testUsers[0];

      const expectedVacancies = helpers.makeExpectedVacancies(
        testUsers,
        testUser.id,
        testVacancies,
        testRequests,
        testProject.id
      );

      return supertest(app)
        .get(`/api/vacancies/${testProject.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, expectedVacancies);
    });
  });

  describe('POST /api/vacancies/:project_id', () => {
    it('creates a vacancy, responding with 201 and the vacancy', () => {
      const testProject = testProjects[0];
      const testUser = testUsers[0];
      const newVacancy = {
        user_id: testUser.id,
        title: 'test new vacancy',
        description: 'test new desc',
        skills: []
      };

      return supertest(app)
        .post(`/api/vacancies/${testProject.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newVacancy)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.title).to.eql(newVacancy.title);
          expect(res.body.description).to.eql(newVacancy.description);
          expect(res.body.skills).to.eql(newVacancy.skills);
          expect(res.body.project_id).to.eql(testProject.id);
        })
        .expect(res => {
          db.from('vacancies')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.title).to.eql(newVacancy.title);
              expect(row.project_id).to.eql(testProject.id);
              expect(row.description).to.eql(newVacancy.description);
              expect(row.skills).to.eql(newVacancy.skills);
            });
        });
    });

    const requiredFields = ['title', 'description'];

    requiredFields.forEach(field => {
      const testProject = testProjects[0];
      const testUser = testUsers[0];
      const newVacancy = {
        user_id: testUser.id,
        title: 'test new vacancy',
        description: 'test new desc',
        skills: []
      };

      it('responds with 400 and an error message if required field is missing', () => {
        delete newVacancy[field];
        return supertest(app)
          .post(`/api/vacancies/${testProject.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newVacancy)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });
  });
  describe('PATCH /api/vacancies/:vacancy_id', () => {
    it('responds with 204 and updates the vacancy', () => {
      const testUser = testUsers[2];
      const idToUpdate = testVacancies[0].id;
      const updatedVacancy = {
        title: 'updated title',
        description: 'updated description',
        user_id: testUser.id
      };

      return supertest(app)
        .patch(`/api/vacancies/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedVacancy)
        .expect(204);
    });

    it('responds with 400 and an error message when no fields are given to update', () => {
      const testUser = testUsers[2];
      const idToUpdate = testVacancies[0].id;

      const updatedVacancy = {};

      return supertest(app)
        .patch(`/api/vacancies/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedVacancy)
        .expect(400, {
          error: `Request body must contain at least one of 'title', 'description', 'skills', or 'user_id'`
        });
    });

    it('responds with 400 and an error message if the vacancy id is invalid', () => {
      const testUser = testUsers[2];
      const idToUpdate = 134;
      const updatedVacancy = {
        title: 'updated title',
        description: 'updated description',
        user_id: testUser.id
      };

      return supertest(app)
        .patch(`/api/vacancies/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedVacancy)
        .expect(404, {
          error: 'Vacancy does not exist'
        });
    });
  });

  describe('DELETE /api/vacancies/vacancy_id', () => {
    it('responds with 204 and deletes the vacancy', () => {
      const idToDelete = testVacancies[0].id;
      const testUser = testUsers[0];
      const testProject = testProjects[0];
      const expectedVacancies = testVacancies.filter(
        vacancy =>
          vacancy.id !== idToDelete && vacancy.project_id === testProject.id
      );
      return supertest(app)
        .delete(`/api/vacancies/${idToDelete}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(204)
        .then(() =>
          supertest(app)
            .get(`/api/vacancies/${testProject.id}`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(expectedVacancies)
        );
    });

    it('responds with 404 and an error message if the id is invalid', () => {
      const idToDelete = 1344;
      const testUser = testUsers[0];

      return supertest(app)
        .delete(`/api/vacancies/${idToDelete}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(404, {
          error: 'Vacancy does not exist'
        });
    });
  });
});
