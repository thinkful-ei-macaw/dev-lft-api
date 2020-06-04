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


  
});
