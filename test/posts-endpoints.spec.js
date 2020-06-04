const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Posts Endpoints', () => {
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

  describe('GET /api/posts/:project_id', () => {
    seedBeforeEach();

    it('responds with 200 and the posts', () => {
      const testProject = testProjects[0];
      const testUser = testUsers[0];
      const expectedPosts = helpers.makeExpectedPosts(
        testUser,
        testPosts,
        testProject.id
      );
      return supertest(app)
        .get(`/api/posts/${testProject.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, expectedPosts);
    });
  });

  describe(`POST /api/posts/:project_id`, () => {
    seedBeforeEach();

    it('creates a post, responding with 201 and the post', () => {
      const testProject = testProjects[0];
      const testUser = testUsers[0];
      const newPost = {
        project_id: testProject.id,
        user_id: testUser.id,
        message: 'test new post'
      };
      return supertest(app)
        .post(`/api/posts/${testProject.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newPost)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.message).to.eql(newPost.message);
        })
        .expect(res =>
          db
            .from('posts')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.message).to.eql(newPost.message);
              expect(row.project_id).to.eql(newPost.project_id);
              expect(row.user_id).to.eql(newPost.user_id);
            })
        );
    });

    it(`responds with 400 and an error message when the message field is missing`, () => {
      const testProject = testProjects[0];
      const testUser = testUsers[0];
      const newPost = {
        project_id: testProject.id,
        user_id: testUser.id
      };

      return supertest(app)
        .post(`/api/posts/${testProject.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newPost)
        .expect(400, {
          error: `Missing 'message' in request body`
        });
    });
  });

  describe('PATCH /api/posts/:post_id', () => {
    seedBeforeEach();

    it('responds with 204 and updates the post', () => {
      const testUser = testUsers[0];
      const testProject = testProjects[0];
      const idToUpdate = testPosts[0].id;
      const updatedPost = {
        message: 'test update post'
      };
      let testPost = helpers.makeExpectedPosts(
        testUser,
        testPosts,
        testProject.id
      );
      const expectedPost = [
        {
          ...testPost[idToUpdate - 1],
          ...updatedPost
        }
      ];

      return supertest(app)
        .patch(`/api/posts/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedPost)
        .expect(204)
        .then(res =>
          supertest(app)
            .get(`/api/posts/${idToUpdate}`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(expectedPost)
        );
    });

    it('responds with 400 and an error message when message field is missing', () => {
      const testUser = testUsers[0];
      const idToUpdate = testPosts[0].id;
      const updatedPost = {};

      return supertest(app)
        .patch(`/api/posts/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedPost)
        .expect(400, {
          error: `Missing 'message' in request body`
        });
    });
  });
});
