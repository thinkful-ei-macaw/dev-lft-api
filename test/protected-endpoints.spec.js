const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Protected endpoints', () => {
  let db;

  const { testUsers } = helpers.makeFixtures();

  before('make a knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from the db', () => db.destroy());

  before('cleanup tables', () => helpers.cleanTables(db));

  afterEach('cleanup tables', () => helpers.cleanTables(db));

  beforeEach('insert data', () => helpers.seedProjectsTables(db, testUsers));

  const protectedChats = [
    {
      name: 'GET /api/chats',
      path: '/api/chats',
      method: supertest(app).get
    },
    {
      name: 'POST /api/chats',
      path: '/api/chats',
      method: supertest(app).post
    },
    {
      name: 'GET /api/chats/:id',
      path: '/api/chats/1',
      method: supertest(app).get
    },
    {
      name: 'PATCH /api/chats/:chat_id',
      path: '/api/chats/1',
      method: supertest(app).patch
    }
  ];

  const protectedPosts = [
    {
      name: 'PATCH /api/posts/:post_id',
      path: '/api/posts/1',
      method: supertest(app).patch
    },
    {
      name: 'GET /api/posts/:project_id',
      path: '/api/posts/1',
      method: supertest(app).get
    },
    {
      name: 'POST /api/posts/:project_id',
      path: '/api/posts/1',
      method: supertest(app).post
    }
  ];

  const protectedProjects = [
    {
      name: 'POST /api/projects',
      path: '/api/posts',
      method: supertest(app).post
    },
    {
      name: 'GET /api/projects/user',
      path: '/api/projects/user',
      method: supertest(app).get
    },
    {
      name: 'GET /api/projects/:project_id',
      path: '/api/projects/1',
      method: supertest(app).get
    },
    {
      name: 'PATCH /api/projects/:project_id',
      path: '/api/projects/1',
      method: supertest(app).patch
    },
    {
      name: 'DELETE /api/projects/:project_id',
      path: '/api/projects/1',
      method: supertest(app).delete
    }
  ];

  const protectedRequests = [
    {
      name: 'POST /api/requests/:vacancy_id',
      path: '/api/requests/1',
      method: supertest(app).post
    },
    {
      name: 'PATCH /api/requests/:request_id',
      path: '/api/requests/1',
      method: supertest(app).patch
    },
    {
      name: 'GET /api/requests/:project_id',
      path: '/api/requests/1',
      method: supertest(app).get
    }
  ];

  const protectedUsers = [
    {
      name: 'GET /api/users/:username',
      path: '/api/users/test-user-1',
      method: supertest(app).get
    },
    {
      name: 'PATCH /api/users',
      path: '/api/users',
      method: supertest(app).patch
    },
    {
      name: 'GET /api/users/profile',
      path: '/api/users/profile',
      method: supertest(app).get
    }
  ];

  const protectedVacancies = [
    {
      name: 'POST /api/vacancies/:project_id',
      path: '/api/vacancies/1',
      method: supertest(app).post
    },
    {
      name: 'GET /api/vacancies/:project_id',
      path: '/api/vacancies/1',
      method: supertest(app).get
    },
    {
      name: 'PATCH /api/vacancies/:vacancy_id',
      path: '/api/vacancies/1',
      method: supertest(app).patch
    },
    {
      name: 'DELETE /api/vacancies/:vacancy_id',
      path: '/api/vacancies/1',
      method: supertest(app).delete
    }
  ];

  const protectedNotifications = [
    {
      name: 'GET /api/notifications',
      path: '/api/notifications',
      method: supertest(app).get
    },
    {
      name: 'PATCH /api/notifications/:notification_id',
      path: '/api/notifications/1',
      method: supertest(app).patch
    }
  ];

  const protectedEndpoints = [
    ...protectedChats,
    ...protectedPosts,
    ...protectedProjects,
    ...protectedRequests,
    ...protectedUsers,
    ...protectedVacancies,
    ...protectedNotifications
  ];

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint
          .method(endpoint.path)
          .expect(401, { error: `Missing bearer token` });
      });

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0];
        const invalidSecret = 'bad-jwt-secret';
        return endpoint
          .method(endpoint.path)
          .set(
            'Authorization',
            helpers.makeAuthHeader(validUser, invalidSecret)
          )
          .expect(401, { error: 'Unauthorized request' });
      });
    });

    it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
      const invalidUser = { username: 'not-a-user', id: 1 };
      return endpoint
        .method(endpoint.path)
        .set('Authorization', helpers.makeAuthHeader(invalidUser))
        .expect(401, { error: 'Unauthorized request' });
    });
  });
});
