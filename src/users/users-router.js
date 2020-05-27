const express = require('express');
const UsersService = require('./users-service');
const AuthService = require('../auth/auth-service');
const { requireAuth } = require('../middleware/jwt-auth');

/**
 * Router to handle all requests to /api/users
 */
const usersRouter = express.Router();
usersRouter.use(express.json());

// POST `/users` to create a new account, respond with auth token
usersRouter.post('/', (req, res, next) => {
  const db = req.app.get('db');
  const { username, first_name, last_name, password } = req.body;

  // check that all required values are provided
  for (const field of ['username', 'first_name', 'last_name', 'password'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });

  // check validity of names rovided
  for (const name of ['first_name', 'last_name']) {
    const nameError = UsersService.validateName(req.body[name]);
    if (nameError)
      return res.status(400).json({ error: `${name} ${nameError}` });
  }

  // check password validity
  const passwordError = UsersService.validatePassword(password);
  if (passwordError)
    return res.status(400).json({ error: passwordError });

  // check if username exists
  UsersService.getItemByField(db, 'username', username)
    .then(user => {
      if (user)
        return res.status(400).json({
          error: 'Username already exists'
        });

      // hash the password
      return UsersService.hashPassword(password)
        .then(hashedPassword => {
          const newUser = {
            username,
            first_name,
            last_name,
            password: hashedPassword,
            date_created: 'now()'
          };

          // store the user data
          return UsersService.insertItem(db, newUser)
            .then(user => {

              // send 'em a token
              const sub = username;
              const payload = { user_id: user.id };
              return res.status(201).json({
                authToken: AuthService.createJwt(sub, payload)
              });
            });
        });
    })
    .catch(next);
});

// GET `/users` to get a list of all users (just the number)
usersRouter.get('/', (req, res, next) => {
  const db = req.app.get('db');

  // get all the users from the table
  UsersService.getAllItems(db)
    .then(users => {

      // send 'em the number
      return res.status(200).json({
        count: users.length
      });

    })
    .catch(next);

});

// GET `/users/:user_id` to get a user's info (not the credentials tho)
usersRouter.get('/:user_id', requireAuth, (req, res, next) => {
  const db = req.app.get('db');
  const { user_id } = req.params;

  // check that an id was provided
  if (!user_id) {
    return res.status(400).json({
      error: `Missing 'user_id' in request params`
    });
  }

  UsersService.getItemById(db, user_id)
    .then(user => {

      // 404 if user doesn't exist
      if (!user)
        return res.status(404).json({
          error: 'User not found'
        });

      // send 'em the user
      return res.status(200).json(UsersService.serializeUser(user));

    })
    .catch(next);
})

// PATCH `/users/:user_id` to update a user's info in the database
usersRouter.patch('/:user_id', requireAuth, (req, res, next) => {
  const db = req.app.get('db');
  const { user_id } = req.params;
  const { first_name, last_name, github_url, linkedin_url, twitter_url } = req.body;
  const updatedUser = { first_name, last_name, github_url, linkedin_url, twitter_url };

  const numberOfValues = Object.values(updatedUser).filter(Boolean).length;
  if (numberOfValues === 0)
    return res.status(400).json({
      error: 'Request body must contain content'
    });

  UsersService.getItemById(db, user_id)
    .then(user => {

      // 404 if user doesn't exist
      if (!user)
        return res.status(404).json({
          error: 'User not found'
        });

      // update the user
      UsersService.updateItem(db, user_id, updatedUser)
        .then(() => {
          return res.status(204).end();
        })
        .catch(next);

    })
    .catch(next);


});

module.exports = usersRouter;