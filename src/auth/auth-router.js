const express = require('express');
const AuthService = require('./auth-service');

/**
 * Router to handle all requests to /api/auth
 */
const authRouter = express.Router();
authRouter.use(express.json());

authRouter.post('/login', (req, res, next) => {
  const db = req.app.get('db');
  const { username, password } = req.body;
  const loginUser = { username, password };

  // check that no fields are blank
  for (const [key, value] of Object.entries(loginUser))
    if (!value)
      return res.status(400).json({
        error: `Missing '${key}' in request body`
      });

  // find user with matching username
  AuthService.getItemByField(db, 'username', username)
    .then(dbUser => {
      if (!dbUser)
        return res.status(400).json({
          error: 'Incorrect username or password'
        });

      // check if passwords match
      return AuthService.comparePasswords(loginUser.password, dbUser.password)
        .then(compareMatch => {
          if (!compareMatch)
            return res.status(400).json({
              error: 'Incorrect username or password'
            });

          // send 'em a token
          const sub = username;
          const payload = { user_id: dbUser.id };
          return res.status(200).json({
            authToken: AuthService.createJwt(sub, payload)
          });
        });
    })
    .catch(next);
});

module.exports = authRouter;