const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Projects Endpoints', function () {
  let db;

  const {
    testUsers,
    testRequests,
    testProjects,
    testVacancies,
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

  describe.only(`GET /api/projects`, () => {
    context(`Given no projects`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get('/api/projects').expect(200, []);
      });
    });

    context('Given there are projects in the database', () => {
      beforeEach('insert projects', () =>
        helpers.seedProjectsTables(
          db,
          testUsers,
          testProjects,
          testVacancies,
          testRequests,
          testPosts,
          testChats,
          testMessages,
          testNotifications
        )
      );

      it('responds with 200 and all of the articles', () => {
        const expectedProjects = testProjects.map(project =>
          helpers.makeExpectedProjects(...)
        );
        return supertest(app)
          .get('/api/projects')
          .expect(200, expectedProjects);
      });
    });  
  });
});
