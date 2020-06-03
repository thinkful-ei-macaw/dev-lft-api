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

  // GET /api/projects endpoint test

  describe(`GET /api/projects`, () => {
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

      it('responds with 200 and all of the projects', () => {
        const expectedProjects = helpers.makeExpectedProjects(testProjects);
        return supertest(app)
          .get('/api/projects')
          .expect(200, expectedProjects);
      });
    });
  });

  // GET /api/projects/user endpoint test

  describe(`GET /api/projects/user`, () => {
    context(`Given no user projects`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get('/api/projects/user').expect(200, []);
      });
    });

    context('Given there are user projects in the database', () => {
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

      it('responds with 200 and all of the user projects', () => {
        const expectedUserProjects = helpers.makeExpectedUserProjects(
          testUsers[2].id,
          testProjects
        );
        return supertest(app)
          .get('/api/projects/user')
          .expect(200, expectedUserProjects);
      });
    });
  });

  // api/projects/:project_id endpoint test

  describe.only(`GET /api/projects/project_id`, () => {
    context(`Given no projects`, () => {
      it(`responds with 404`, () => {
        const project_id = 12345;
        return supertest(app)
          .get(`/api/projects/${project_id}`)
          .expect(404, { error: `Project doesn't exist` });
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

      it('responds with 200 and the specified project', () => {
        const project_id = 1;
        const expectedProjects = helpers.makeExpectedProjects(testProjects);
        return supertest(app)
          .get(`/api/projects/${project_id}`)
          .expect(200, expectedProjects[0]);
      });
    });
  });

  // POST api/projects/ endpoint test

  describe(`GET /api/projects`, () => {
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

      it('creates a project, responding with 201 and the new project', () => {
        const testProject = testProjects[0];
        return supertest(app)
          .get('/api/projects')
          .send(testProject)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.name).to.eql(testProject.name);
            expect(res.body.description).to.eql(testProject.description);
            expect(res.body.tags).to.eql(testProject.tags);
            expect(res.body.live_url).to.eql(testProject.live_url);
            expect(res.body.github_url).to.eql(testProject.github_url);
            expect(res.headers.location).to.eql(`/api/projects/${res.body.id}`);
            const expectedDate = new Date().toLocaleString('en', {
              timeZone: 'UTC'
            });
            const actualDate = new Date(res.body.date_created).toLocaleString();
            expect(actualDate).to.eql(expectedDate);
            expect(typeof res.body.isOwner).to.eql(typeof testProject.isOwner);
          })
          .expect(res =>
            db
              .from('projects')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.name).to.eql(testProject.name);
                expect(row.description).to.eql(testProject.description);
                expect(row.tags).to.eql(testProject.tags);
                expect(row.live_url).to.eql(testProject.live_url);
                expect(row.trello_url).to.eql(testProject.trello_url);
                expect(row.github_url).to.eql(testProject.github_url);
                const expectedDate = new Date().toLocaleString('en', {
                  timeZone: 'UTC'
                });
                const actualDate = new Date(row.date_created).toLocaleString();
                expect(actualDate).to.eql(expectedDate);
              })
          );
      });
    });
  });

  // PATCH api/projects/:project_id endpoint test

  describe(`GET /api/projects`, () => {
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

      it('responds with 200 and all of the projects', () => {
        const expectedProjects = helpers.makeExpectedProjects(testProjects);
        return supertest(app)
          .get('/api/projects')
          .expect(200, expectedProjects);
      });
    });
  });

  // DELETE api/projects/:project_id endpoint test

  describe(`GET /api/projects`, () => {
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

      it('responds with 200 and all of the projects', () => {
        const expectedProjects = helpers.makeExpectedProjects(testProjects);
        return supertest(app)
          .get('/api/projects')
          .expect(200, expectedProjects);
      });
    });
  });
});
