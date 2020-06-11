const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const helpers = require('./test-helpers');

describe('User Endpoints', function () {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

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

  describe(`GET /api/users/:username`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    it(`responds with a 404 if the user doesn't exist`, () => {
      const newUser = {
        username: 'test username',
        password: 'test12345A@',
        first_name: 'firstname',
        last_name: 'lastname'
      };
      return supertest(app)
        .get(`/api/users/${newUser.username}`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(newUser)
        .expect(404, { error: `user not found` });
    });

    it(`responds with a 200 and the user info`, () => {
      return supertest(app)
        .get(`/api/users/${testUser.username}`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(res => {
          expect(res.body.username).to.eql(testUser.username);
          expect(res.body.first_name).to.eql(testUser.first_name);
          expect(res.body.last_name).to.eql(testUser.last_name);
          expect(res.body.username).to.eql(testUser.username);
          expect(res.body.skills).to.eql(testUser.skills);
          expect(res.body.bio).to.eql(testUser.bio);
          expect(res.body.username).to.eql(testUser.username);
          expect(res.body.notifications).to.eql(testUser.notifications);
          expect(res.body).to.not.have.property('password');
          expect(res.body).to.have.property('github_url');
          expect(res.body).to.have.property('linkedin_url');
          expect(res.body).to.have.property('twitter_url');
          expect(res.body).to.have.property('date_created');
        });
    });
  });

  describe(`GET /api/users/profile`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    it(`responds with a 200 and the user profile`, () => {
      return supertest(app)
        .get(`/api/users/profile`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(res => {
          expect(res.body.username).to.eql(testUser.username);
          expect(res.body.first_name).to.eql(testUser.first_name);
          expect(res.body.last_name).to.eql(testUser.last_name);
          expect(res.body).to.not.have.property('password');
          expect(res.body).to.have.property('github_url');
          expect(res.body).to.have.property('linkedin_url');
          expect(res.body).to.have.property('twitter_url');
          expect(res.body).to.have.property('date_created');
        });
    });
  });

  describe(`POST /api/users`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    const requiredFields = ['username', 'password', 'first_name', 'last_name'];

    requiredFields.forEach(field => {
      const registerAttemptBody = {
        username: 'test username',
        password: 'test password',
        first_name: 'test first name',
        last_name: 'test last name'
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete registerAttemptBody[field];

        return supertest(app)
          .post('/api/users')
          .send(registerAttemptBody)
          .expect(400, {
            error: `missing '${field}' in request body`
          });
      });
    });

    it(`responds 400 'must be 2 or more characters' when writing first name`, () => {
      const userShortFirstName = {
        username: 'test username',
        password: '1234ABcd@',
        first_name: 'a',
        last_name: 'lastname'
      };
      return supertest(app)
        .post('/api/users')
        .send(userShortFirstName)
        .expect(400, { error: `first_name must be 2 or more characters` });
    });

    it(`responds 400 'must be 2 or more characters' when writing last name`, () => {
      const userShortLastName = {
        username: 'test username',
        password: '1234ABcd@',
        first_name: 'firstname',
        last_name: 'l'
      };
      return supertest(app)
        .post('/api/users')
        .send(userShortLastName)
        .expect(400, { error: `last_name must be 2 or more characters` });
    });

    it(`responds 400 'must be fewer than 30 characters' when long first name`, () => {
      const userShortUsername = {
        username: 'test username',
        password: '1234ABcd@',
        first_name: 'f'.repeat(31),
        last_name: 'lastname'
      };
      return supertest(app)
        .post('/api/users')
        .send(userShortUsername)
        .expect(400, { error: `first_name must be fewer than 30 characters` });
    });

    it(`responds 400 'must be fewer than 30 characters' when long last name`, () => {
      const userShortUsername = {
        username: 'test username',
        password: '1234ABcd@',
        first_name: 'firstname',
        last_name: 'l'.repeat(31)
      };
      return supertest(app)
        .post('/api/users')
        .send(userShortUsername)
        .expect(400, { error: `last_name must be fewer than 30 characters` });
    });

    it(`responds 400 'must contain only alphabetic characters and no spaces' when first name contains numbers or spaces`, () => {
      const userShortUsername = {
        username: 'test username',
        password: '1234ABcd@',
        first_name: 'firstna898me',
        last_name: 'lastname'
      };
      return supertest(app)
        .post('/api/users')
        .send(userShortUsername)
        .expect(400, {
          error: `first_name must contain only alphabetic characters and no spaces`
        });
    });

    it(`responds 400 'must contain only alphabetic characters and no spaces' when last name contains numbers or spaces`, () => {
      const userShortUsername = {
        username: 'test username',
        password: '1234ABcd@',
        first_name: 'firstname',
        last_name: 'lastn888ame'
      };
      return supertest(app)
        .post('/api/users')
        .send(userShortUsername)
        .expect(400, {
          error: `last_name must contain only alphabetic characters and no spaces`
        });
    });

    it(`responds 400 'password must be 8 or more characters' when empty password`, () => {
      const userShortPassword = {
        username: 'test username',
        password: '1234567',
        first_name: 'firstname',
        last_name: 'lastname'
      };
      return supertest(app)
        .post('/api/users')
        .send(userShortPassword)
        .expect(400, { error: `password must be 8 or more characters` });
    });

    it(`responds 400 'password must be fewer than 72 characters' when long password`, () => {
      const userLongPassword = {
        username: 'test username',
        password: '*'.repeat(73),
        first_name: 'firstname',
        last_name: 'lastname'
      };
      return supertest(app)
        .post('/api/users')
        .send(userLongPassword)
        .expect(400, { error: `password must be fewer than 72 characters` });
    });

    it(`responds 400 error when password starts with spaces`, () => {
      const userPasswordStartsSpaces = {
        username: 'test username',
        password: ' 1aB!!#cDg',
        first_name: 'firstname',
        last_name: 'lastname'
      };
      return supertest(app)
        .post('/api/users')
        .send(userPasswordStartsSpaces)
        .expect(400, {
          error: `password must not start or end with empty spaces`
        });
    });

    it(`responds 400 error when password ends with spaces`, () => {
      const userPasswordEndsSpaces = {
        username: 'test username',
        password: '1aB!!#cDg ',
        first_name: 'firstname',
        last_name: 'lastname'
      };
      return supertest(app)
        .post('/api/users')
        .send(userPasswordEndsSpaces)
        .expect(400, {
          error: `password must not start or end with empty spaces`
        });
    });

    it(`responds 400 error when password isn't complex enough`, () => {
      const userPasswordNotComplex = {
        username: 'test username',
        password: '111aabbc',
        first_name: 'firstname',
        last_name: 'lastname'
      };
      return supertest(app)
        .post('/api/users')
        .send(userPasswordNotComplex)
        .expect(400, {
          error: `password must contain at least 1 uppercase, lowercase and number characters`
        });
    });

    it(`responds 400 'username already exists' when username isn't unique`, () => {
      const duplicateUser = {
        username: testUser.username,
        password: '11aaA!!b',
        first_name: 'firstname',
        last_name: 'lastname'
      };
      return supertest(app)
        .post('/api/users')
        .send(duplicateUser)
        .expect(400, { error: `username already exists` });
    });

    describe(`Given a valid user`, () => {
      it(`responds 201 with Auth Token`, function () {
        this.retries(3);
        const newUser = {
          username: 'test_username',
          password: '11AAaa@bc',
          first_name: 'firstname',
          last_name: 'lastname'
        };
        const expectedToken = jwt.sign(
          { first_name: newUser.first_name, last_name: newUser.last_name },
          process.env.JWT_SECRET,
          {
            subject: newUser.username,
            algorithm: 'HS256'
          }
        );
        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(201, { authToken: expectedToken });
      });

      it(`stores the new user in db with bcryped password`, () => {
        const newUser = {
          id: 5,
          username: 'test_username',
          password: '11AAaa@bc',
          first_name: 'firstname',
          last_name: 'lastname'
        };
        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(() =>
            db
              .from('users')
              .select('*')
              .where({ id: newUser.id })
              .first()
              .then(row => {
                expect(row.username).to.eql(newUser.username);
                expect(row.first_name).to.eql(newUser.first_name);
                expect(row.last_name).to.eql(newUser.last_name);
                return bcrypt.compare(newUser.password, row.password);
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true;
              })
          );
      });
    });
  });

  describe(`PATCH /api/users`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    it('returns 400 and an error message if firstname too short', () => {
      const updateUser = { first_name: 'k' };
      return supertest(app)
        .patch(`/api/users`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(updateUser)
        .expect(400, { error: `first_name must be 2 or more characters` });
    });

    it('returns 400 and an error message if lastname too short', () => {
      const updateUser = { last_name: 'k' };
      return supertest(app)
        .patch(`/api/users`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(updateUser)
        .expect(400, { error: `last_name must be 2 or more characters` });
    });

    it('returns 400 and an error message if firstname too long', () => {
      const updateUser = { first_name: 'f'.repeat(31) };
      return supertest(app)
        .patch(`/api/users`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(updateUser)
        .expect(400, { error: `first_name must be fewer than 30 characters` });
    });

    it('returns 400 and an error message if lastname too long', () => {
      const updateUser = { last_name: 'f'.repeat(31) };
      return supertest(app)
        .patch(`/api/users`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(updateUser)
        .expect(400, { error: `last_name must be fewer than 30 characters` });
    });

    it('returns 400 and an error message if firstname contains forbidden characters', () => {
      const updateUser = { first_name: '$3.50' };
      return supertest(app)
        .patch(`/api/users`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(updateUser)
        .expect(400, {
          error:
            'first_name must contain only alphabetic characters and no spaces'
        });
    });

    it('returns 400 and an error message if lastname contains forbidden characters', () => {
      const updateUser = { last_name: '$3.50' };
      return supertest(app)
        .patch(`/api/users`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(updateUser)
        .expect(400, {
          error:
            'last_name must contain only alphabetic characters and no spaces'
        });
    });

    it('returns 400 and an error message if bio too long', () => {
      const updateUser = { bio: 'f'.repeat(501) };
      return supertest(app)
        .patch(`/api/users`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(updateUser)
        .expect(400, { error: `bio must be fewer than 500 characters` });
    });

    it('returns 400 and an error message if lastname too short', () => {
      const updateUser = { bio: 'f' };
      return supertest(app)
        .patch(`/api/users`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(updateUser)
        .expect(400, { error: `bio must be longer than 30 characters` });
    });

    it('returns 400 and an error message if user adds more than 10 skills', () => {
      const updateUser = {
        skills: [
          'test0',
          'test1',
          'test2',
          'test3',
          'test4',
          'test5',
          'test6',
          'test7',
          'test8',
          'test9',
          'test10'
        ]
      };
      return supertest(app)
        .patch(`/api/users`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(updateUser)
        .expect(400, { error: `you may add a maximum of 10 skills` });
    });

    it('returns 400 and an error message if any skill is too long', () => {
      const updateUser = { skills: ['f'.repeat(31)] };
      return supertest(app)
        .patch(`/api/users`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(updateUser)
        .expect(400, { error: `skills must be fewer than 30 characters` });
    });

    it('returns 400 and an error message if any skill is too short', () => {
      const updateUser = { skills: ['f'] };
      return supertest(app)
        .patch(`/api/users`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(updateUser)
        .expect(400, { error: `skills must be longer than 2 characters` });
    });

    const skills = [':', '$', '%', '{', '|', '*', '^'];

    skills.forEach(skill => {
      it('returns 400 and an error message if skill has forbidden characters', () => {
        const updateUser = { skills: [skill] };
        return supertest(app)
          .patch(`/api/users`)
          .set(`Authorization`, helpers.makeAuthHeader(testUser))
          .send(updateUser)
          .expect(400, {
            error:
              'skills can only contain letters, numbers, spaces, periods, and hyphens'
          });
      });
    });

    it(`returns a 400 if no values provided to update`, () => {
      const updateUser = {};
      return supertest(app)
        .patch(`/api/users`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(updateUser)
        .expect(400, { error: `no content provided to update` });
    });

    it(`returns a 204 for successful update`, () => {
      const updatedUser = {
        username: 'test-user-1',
        password: 'testPass123',
        first_name: 'mickey',
        last_name: 'mouse',
        github_url: 'https://github.com/mickey'
      };
      return supertest(app)
        .patch(`/api/users`)
        .set(`Authorization`, helpers.makeAuthHeader(testUser))
        .send(updatedUser)
        .expect(204);
    });
  });
});
