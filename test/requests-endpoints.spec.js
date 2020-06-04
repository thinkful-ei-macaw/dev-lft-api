const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Requests endpoints', () => {
  let db;

  function seedBeforeEach() {
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
  }

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

  describe('GET /api/requests/:project_id', () => {
    seedBeforeEach();
    it('responds with 200 and the requests', () => {
      const testVacancy = testVacancies[0];
      const testProject = testProjects[0];
      const testUser = testUsers[0];

      const expectedRequests = helpers.makeExpectedRequests(
        testUsers,
        testRequests,
        testVacancies,
        testVacancy.id
      );

      return supertest(app)
        .get(`/api/requests/${testProject.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, expectedRequests);
    });

    it('responds with 404 and an error message if the id is invalid', () => {
      const invalidId = 243;
      const testUser = testUsers[0];

      return supertest(app)
        .get(`/api/requests/${invalidId}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(404, {
          error: 'Project not found'
        });
    });
  });

  describe('POST /api/requests/vacancy_id', () => {
    seedBeforeEach();

    it('creates a request, responding with 201 and the request', () => {
      let testUser = testUsers[3];
      let testVacancy = testVacancies[0];

      return supertest(app)
        .post(`/api/requests/${testVacancy.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.vacancy_id).to.eql(testVacancy.id);
          expect(res.body.user_id).to.eql(testUser.id);
          expect(res.body.status).to.eql('pending');
        });
    });

    it('reponds with 400 and error message if request already exists', () => {
      const testUser = testUsers[1];
      const testVacancy = testVacancies[1];

      return supertest(app)
        .post(`/api/requests/${testVacancy.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(400, {
          error: `Request for same vacancy by this user already exists`
        });
    });
  });
});
