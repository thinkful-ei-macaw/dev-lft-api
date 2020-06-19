const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Chats Endpoints', () => {
  let db;

  const {
    testUsers,
    testRequests,
    testProjects,
    testVacancies,
    testPosts,
    testChats,
    testMessages
  } = helpers.makeFixtures();

  before('make a knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from the db', () => db.destroy());

  before('cleanup tables', () => helpers.cleanTables(db));

  afterEach('cleanup tables', () => helpers.cleanTables(db));

  beforeEach('insert data', () =>
    helpers.seedProjectsTables(
      db,
      testUsers,
      testProjects,
      testVacancies,
      testRequests,
      testPosts,
      testChats,
      testMessages
    )
  );

  describe(`POST /api/chats`, () => {
    it(`POST /api/chats responds 201 and the resulting message`, () => {
      const newMessage = {
        body: 'test body',
        request_id: testProjects[0].id,
        recipient_username: testUsers[1].username
      };

      return supertest(app)
        .post('/api/chats')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newMessage)
        .expect(201)
        .expect(res => {
          const { resultingMessage } = res.body;
          expect(res.body).to.be.an('object');
          expect(resultingMessage).to.be.an('object');
          expect(resultingMessage.author_id).to.eql(testUsers[0].id);
          expect(resultingMessage.body).to.eql(newMessage.body);
        });
    });

    const requiredFields = ['body', 'request_id', 'recipient_username'];

    requiredFields.forEach(field => {
      it(`POST /api/chats responds 400 missing ${field} in request body when missing`, () => {
        const badRequest = {
          body: 'test body',
          request_id: testProjects[0].id,
          recipient_username: testUsers[1].username
        };

        delete badRequest[field];

        return supertest(app)
          .post('/api/chats')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(badRequest)
          .expect(400, { error: `Missing ${field} in request body` });
      });
    });
  });

  describe(`GET /api/chats`, () => {
    it(`GET /api/chats responds 200 with expected messages`, () => {
      const testUser = testUsers[0];
      const expectedMessages = helpers.makeExpectedChats(
        testChats,
        testUser.id,
        testUsers,
        testProjects,
        testMessages,
        testRequests,
        testVacancies
      );

      return supertest(app)
        .get('/api/chats')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, expectedMessages);
    });

    // XSS test
    context(`Given an XSS attack message`, () => {
      const testUser = testUsers[0];
      const testChat = testChats[0];
      const { maliciousMessage, expectedMessage } = helpers.makeMaliciousData(
        testUser,
        testChat
      );
      beforeEach('insert malicious message', () => {
        return helpers.seedMaliciousMessage(db, maliciousMessage);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/chats`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].messages[0].body).to.eql(expectedMessage.body);
          });
      });
    });
  });

  describe(`GET /api/chats/:chat_id`, () => {
    it(`GET /api/chats/:chat_id responds 200 with all messages at chat_id`, () => {
      const testUser = testUsers[0];
      const testChatId = testChats[0].id;
      const expectedMessages = helpers.makeExpectedMessages(
        testChatId,
        testUser.id,
        testUsers,
        testMessages
      );

      return supertest(app)
        .get(`/api/chats/${testChatId}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(res => {
          expect(res.body).to.be.an('object');
          expect(res.body.allMessages).to.be.an('array');
          expect(res.body.allMessages[0]).to.be.an('object');
          expect(res.body.allMessages).to.eql(expectedMessages);
        });
    });
    // XSS test - malicious project
    context(`Given an XSS attack chat`, () => {
      const testUser = testUsers[0];
      const { maliciousMessage, expectedMessage } = helpers.makeMaliciousData(
        testUser,
        testChats[0]
      );
      beforeEach('insert malicious message', () => {
        return helpers.seedMaliciousMessage(db, maliciousMessage);
      });

      it('removes XSS attack content', () => {
        const testMessage = testMessages[0];
        return supertest(app)
          .get(`/api/chats/${testMessage.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.allMessages[0].body).to.eql(expectedMessage.body);
          });
      });
    });

    it(`PATCH /api/chats/:chat_id responds 204 when closing chat`, () => {
      const testUser = testUsers[0];
      const testChatId = testChats[0].id;
      const request = {
        closed: true
      };
      return supertest(app)
        .patch(`/api/chats/${testChatId}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(request)
        .expect(204);
    });

    it(`PATCH /api/chats/:chat_id responds 400 when closed status invalid`, () => {
      const testUser = testUsers[0];
      const testChatId = testChats[0].id;
      const request = {
        closed: 'invalid-status'
      };
      return supertest(app)
        .patch(`/api/chats/${testChatId}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(request)
        .expect(400, {
          error: `Chat closed status must be either 'true' or 'false'`
        });
    });

    it(`PATCH /api/chats/:chat_id responds 401 Unauthorized when user is not author`, () => {
      const testUser = testUsers[2];
      const testChatId = testChats[0].id;
      const request = {
        closed: true
      };
      return supertest(app)
        .patch(`/api/chats/${testChatId}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(request)
        .expect(401, {
          error: `Unauthorized request.`
        });
    });
  });
});
