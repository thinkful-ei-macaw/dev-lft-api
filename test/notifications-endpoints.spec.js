const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Notifications Endpoints', () => {
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
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('GET /api/notifications', () => {
    it('responds with 200 and the notifications', () => {
      const testUser = testUsers[0];
      const expectedNotifications = helpers.makeExpectedNotifications(
        testUser.id,
        testNotifications,
        testProjects
      );

      return supertest(app)
        .get(`/api/notifications`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, expectedNotifications);
    });
  });

  describe('PATCH /api/notifications/:notification_id', () => {
    it('responds with 204 and updates the notification', () => {
      const testUser = testUsers[0];
      const idToUpdate = testNotifications[0].id;
      const updatedNotification = {
        seen: true
      };

      return supertest(app)
        .patch(`/api/notifications/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedNotification)
        .expect(204);
    });

    it('responds with 404 and error message when notification does not exist', () => {
      const testUser = testUsers[0];
      const idToUpdate = 5423;
      const updatedNotification = {
        seen: true
      };

      return supertest(app)
        .patch(`/api/notifications/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedNotification)
        .expect(404, {
          error: 'Notification does not exist'
        });
    });

    it('responds with 400 and error message when invalid body', () => {
      const testUser = testUsers[0];
      const idToUpdate = testNotifications[0].id;
      const updatedNotification = {
        invalid: 'invalid'
      };

      return supertest(app)
        .patch(`/api/notifications/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedNotification)
        .expect(400, {
          error: `Request body must contain 'seen'`
        });
    });

    it('responds with 400 and error message when missing body', () => {
      const testUser = testUsers[0];
      const idToUpdate = testNotifications[0].id;
      const updatedNotification = {};

      return supertest(app)
        .patch(`/api/notifications/${idToUpdate}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedNotification)
        .expect(400, {
          error: `Request body must contain 'seen'`
        });
    });
  });
});
