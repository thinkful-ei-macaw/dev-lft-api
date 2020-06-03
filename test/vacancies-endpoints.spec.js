const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Vacancies Endpoints', () => {
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

    it('creates a vacancy, responding with 201 and the vacancy', () => {
      const testProject = testProjects[0];
      const testUser = testUsers[0];
      const newVacancy = { 
        user_id: testUser.id,
        title: 'test new vacancy',
        description: 'test new desc',
        skills: [],
      }

      return supertest(app)
      .post(`/api/vacancies/${testProject.id}`)
      .set('Authorization', helpers.makeAuthHeader(testUser))
      .send(newVacancy)
      .expect(201)
      .expect(res => {
        expect(res.body).to.have.property('id');
        expect(res.body.title).to.eql(newVacancy.title)
        expect(res.body.description).to.eql(newVacancy.description)
        expect(res.body.skills).to.eql(newVacancy.skills)
        expect(res.body.project_id).to.eql(testProject.id)
      })
      .expect(res => {
        db  
          .from('vacancies')
          .select('*')
          .where({ id: res.body.id })
          .first()
          .then(row => {
            expect(row.title).to.eql(newVacancy.title);
            expect(row.project_id).to.eql(testProject.id);
            expect(row.description).to.eql(newVacancy.description);
            expect(row.skills).to.eql(newVacancy.skills);
          })
      })
    })
  });
});
