const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Projects Endpoints', function () {
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

  describe.only(`GET /api/projects`, () => {
    context(`Given no projects`, () => {
      it.only(`responds with 200 and an empty list`, () => {
        return supertest(app).get('/api/projects').expect(200, []);
      });
    });

    context('Given there are projects in the database', () => {
      const testUser = testUsers[0];
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
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedProjects);
      });
    });

    // XSS test - malicious project
    context(`Given an XSS attack project`, () => {
      const testUser = testUsers[0];
      const {
        maliciousProject,
        expectedProject,
        maliciousVacancy
      } = helpers.makeMaliciousData(testUser, testChats[0]);
      beforeEach('insert malicious project', () => {
        return helpers.seedMaliciousProject(
          db,
          testUser,
          maliciousProject,
          maliciousVacancy
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/projects`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedProject.name);
            expect(res.body[0].description).to.eql(expectedProject.description);
          });
      });
    });
  });

  // GET /api/projects/user endpoint test

  describe(`GET /api/projects/user`, () => {
    context(`Given no user projects`, () => {
      const testUser = testUsers[0];
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/projects/user')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, []);
      });
    });

    context('Given there are user projects in the database', () => {
      const testUser = testUsers[0];
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
          testUser.id,
          testProjects
        );
        return supertest(app)
          .get('/api/projects/user')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedUserProjects);
      });
    });

    // XSS test - malicious project
    context(`Given an XSS attack project`, () => {
      const testUser = testUsers[0];
      const {
        maliciousProject,
        expectedProject,
        maliciousVacancy
      } = helpers.makeMaliciousData(testUser, testChats[0]);
      beforeEach('insert malicious project', () => {
        return helpers.seedMaliciousProject(
          db,
          testUser,
          maliciousProject,
          maliciousVacancy
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/projects/user`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedProject.name);
            expect(res.body[0].description).to.eql(expectedProject.description);
          });
      });
    });
  });

  // api/projects/:project_id endpoint test

  describe(`GET /api/projects/project_handle`, () => {
    context(`Given no projects`, () => {
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
      it(`responds with 404`, () => {
        const testUser = testUsers[0];
        const project_handle = 'bad-handle';
        return supertest(app)
          .get(`/api/projects/${project_handle}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, {
            error: `No project found with handle ${project_handle}`
          });
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
        const testUser = testUsers[0];
        const project_id = 1;
        const projects = helpers.makeExpectedProjects(
          testProjects,
          testVacancies
        );

        const project_handle = projects[0].handle;
        const expectedProject = projects[0];
        expectedProject.userRole = 'owner';

        return supertest(app)
          .get(`/api/projects/${project_handle}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedProject);
      });
    });
    // XSS test - malicious project
    context(`Given an XSS attack project`, () => {
      const testUser = testUsers[0];
      const {
        maliciousProject,
        expectedProject,
        maliciousVacancy
      } = helpers.makeMaliciousData(testUser, testChats[0]);
      beforeEach('insert malicious project', () => {
        return helpers.seedMaliciousProject(
          db,
          testUser,
          maliciousProject,
          maliciousVacancy
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/projects/${maliciousProject.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql(expectedProject.name);
            expect(res.body.description).to.eql(expectedProject.description);
          });
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
        const testUser = testUsers[0];
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
          .set('Authorization', helpers.makeAuthHeader(testUser))
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
              .get(`/api/projects/${expectedProject.handle}`)
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
        const testUser = testUsers[0];
        const project_handle = 'bad-handle';
        return supertest(app)
          .get(`/api/projects/${project_handle}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, {
            error: `No project found with handle ${project_handle}`
          });
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
        const testUser = testUsers[0];
        const idToRemove = 1;
        const expectedProjects = helpers
          .makeExpectedProjects(testProjects, testVacancies)
          .filter(project => project.id !== idToRemove);

        return supertest(app)
          .delete(`/api/projects/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(204)
          .then(() => {
            return supertest(app).get(`/api/projects`).expect(expectedProjects);
          });
      });
    });
  });
});
