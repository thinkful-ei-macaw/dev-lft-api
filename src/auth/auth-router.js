const express = require('express');
const AuthService = require('./auth-service');

const authRouter = express.Router();
const bodyParser = express.json();

authRouter
  .route('/login')
  .post(bodyParser, async (req, res, next) => {
    try {
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
      const dbUser = await AuthService.getItemWhere(db, { username })
      if (!dbUser)
        return res.status(400).json({
          error: 'Incorrect username or password'
        });

      // check if passwords match
      const compareMatch = await AuthService.comparePasswords(loginUser.password, dbUser.password);
      if (!compareMatch)
        return res.status(400).json({
          error: 'Incorrect username or password'
        });

      // send 'em a token
      const sub = username;
      const payload = { first_name: dbUser.first_name, last_name: dbUser.last_name };
      return res.status(200).json({
        authToken: AuthService.createJwt(sub, payload)
      });

    } catch (error) {
      next(error);
    }
  });

module.exports = authRouter;