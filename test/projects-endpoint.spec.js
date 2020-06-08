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

      it('responds with 200 and all of the projects with vacancies', () => {
        const expectedProjects = helpers.makeExpectedProjects(
          testProjects,
          testVacancies
        );
        return supertest(app)
          .get('/api/projects')
          .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
          .expect(200, expectedProjects);
      });
    });
  });

  // GET /api/projects/user endpoint test

  describe(`GET /api/projects/user`, () => {
    context(`Given no user projects`, () => {
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/projects/user')
          .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
          .expect(200, []);
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
          testProjects,
          testVacancies
        );
        return supertest(app)
          .get('/api/projects/user')
          .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
          .expect(200, expectedUserProjects);
      });
    });
  });

  // api/projects/:project_id endpoint test

  describe(`GET /api/projects/project_id`, () => {
    context(`Given no projects`, () => {
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
      it(`responds with 404`, () => {
        const project_id = 12345;
        return supertest(app)
          .get(`/api/projects/${project_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
          .expect(404, { error: `No project found with id ${project_id}` });
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
        const projects = helpers.makeExpectedProjects(
          testProjects,
          testVacancies
        );
        const expectedProject = projects[0];
        expectedProject.userRole = 'user';

        return supertest(app)
          .get(`/api/projects/${project_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
          .expect(200, expectedProject);
      });
    });
  });

  // POST api/projects/ endpoint test

describe(`POST /api/projects`, () => {
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
        const newProject = {
          id: testProject.id,
          name: 'new name',
          creator_id: testProject.creator_id,
          handle: 'new-name',
          description: testProject.description,
          date_created: testProject.date_created
        };
        return supertest(app)
          .post('/api/projects')
          .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
          .send(newProject)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.name).to.eql(newProject.name);
            expect(res.body.description).to.eql(newProject.description);
            expect(res.body.handle).to.eql(newProject.handle);
            const expectedDate = new Date().toLocaleString();
            const actualDate = new Date(res.body.date_created).toLocaleString();
            expect(actualDate).to.eql(expectedDate);
          })
          .expect(res =>
            db
              .from('projects')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.name).to.eql(newProject.name);
                expect(row.description).to.eql(newProject.description);
                expect(row.handle).to.eql(newProject.handle);
                const expectedDate = new Date().toLocaleString();
                const actualDate = new Date(row.date_created).toLocaleString();
                expect(actualDate).to.eql(expectedDate);
              })
          );
      });
    });
  });

  // PATCH api/projects/:project_id endpoint test

  describe(`PATCH /api/projects/:project_id`, () => {
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

      it('responds with 204 and updates the project', () => {
        const testUser = testUsers[0];
        const idToUpdate = testProjects[0].id;
        const updatedProject = {
          name: 'test update project name',
          description: 'test update project description'
        };
        const testProject = helpers.makeExpectedProjects(
          testProjects,
          testVacancies
        )[0];
        const expectedProject = testProject;
        expectedProject.name = updatedProject.name;
        expectedProject.description = updatedProject.description;
        expectedProject.userRole = 'owner';

        return supertest(app)
          .patch(`/api/projects/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(updatedProject)
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/projects/${idToUpdate}`)
              .set('Authorization', helpers.makeAuthHeader(testUser))
              .expect(expectedProject)
          );
      });
    });
  });
  // DELETE api/projects/:project_id endpoint test

  describe(`DELETE /api/projects/:project_id`, () => {
    context(`Given no projects`, () => {
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
      it(`responds with 404`, () => {
        const project_id = 12345;
        return supertest(app)
          .get(`/api/projects/${project_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `No project found with id ${project_id}` });
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

      it('responds with 204 and removes the project', () => {
        const idToRemove = 1;
        const expectedProjects = helpers
          .makeExpectedProjects(testProjects, testVacancies)
          .filter(project => project.id !== idToRemove);

        return supertest(app)
          .delete(`/api/projects/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(204)
          .then(() => {
            return supertest(app).get(`/api/projects`).expect(expectedProjects);
          });
      });
    });
  });
});
