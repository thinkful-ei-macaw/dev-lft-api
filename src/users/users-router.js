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
usersRouter.post('/', async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { username, first_name, last_name, password } = req.body;

    // check that all required values are provided
    for (const field of ['username', 'first_name', 'last_name', 'password'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        });

    // check validity of names provided
    for (const name of ['first_name', 'last_name']) {
      const nameError = UsersService.validateName(req.body[name]);
      if (nameError)
        return res.status(400).json({ error: `${name} ${nameError}` });
    }

    // check password validity
    const passwordError = UsersService.validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    // check if username exists
    const user = await UsersService.getItemWhere(db, { username });
    if (user)
      return res.status(400).json({
        error: 'Username already exists'
      });

    // check username validity
    const usernameError = UsersService.validateUsername(username);
    if (usernameError)
      return res.status(400).json({ error: `username ${usernameError}` });

    // hash the password
    const hashedPassword = await UsersService.hashPassword(password);
    const newUser = {
      username,
      first_name,
      last_name,
      password: hashedPassword,
      date_created: 'now()'
    };

    // store the user data
    const dbUser = await UsersService.insertItem(db, newUser);

    // send 'em a token
    const sub = username;
    const payload = {
      first_name: dbUser.first_name,
      last_name: dbUser.last_name
    };
    return res.status(201).json({
      authToken: AuthService.createJwt(sub, payload)
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const user_id = req.user.id;
    const userProfile = await UsersService.getItemWhere(db, { id: user_id });

    if (!userProfile) {
      return res.status(404).json({ error: `Could not find user profile.` });
    }

    return res.status(200).json(UsersService.serializeUser(userProfile));
  } catch (error) {
    next(error);
  }
});

// GET `/users/:username` to get a user's info (not the credentials tho)
usersRouter.get('/:username', requireAuth, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const { username } = req.params;

    // check that a username was provided
    if (!username) {
      return res.status(400).json({
        error: `Missing 'username' in request params`
      });
    }

    // check that the user exists
    const user = await UsersService.getItemWhere(db, { username });
    if (!user)
      return res.status(404).json({
        error: 'User not found'
      });

    // send 'em the user otherwise
    return res.status(200).json(UsersService.serializeUser(user));
  } catch (error) {
    next(error);
  }
});

// PATCH `/users` to update a user's info in the database
usersRouter.patch('/', requireAuth, async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const user_id = req.user.id;

    const {
      first_name,
      last_name,
      github_url,
      linkedin_url,
      twitter_url,
      bio,
      skills
    } = req.body;

    const updatedUser = {
      first_name,
      last_name,
      github_url,
      linkedin_url,
      twitter_url,
      bio
    };

    // check validity of names if provided
    for (const name of ['first_name', 'last_name']) {
      if (req.body[name]) {
        const nameError = UsersService.validateName(req.body[name]);
        if (nameError)
          return res.status(400).json({ error: `${name} ${nameError}` });
      }
    }

    for (const url of ['github_url', 'linkedin_url', 'twitter_url']) {
      if (req.body[url]) {
        const urlError = UsersService.validateURL(req.body[url]);
        if (urlError)
          return res
            .status(400)
            .json({ error: `${req.body[url]} ${urlError}` });
      }
    }

    // check that they gave any values to update
    const numberOfValues = Object.values(updatedUser).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: 'Request body must contain content'
      });

    // check that the user exists
    const user = await UsersService.getItemById(db, user_id);
    if (!user)
      return res.status(404).json({
        error: 'User not found'
      });

    if(bio && bio.length > 500) {
      return res.status(400).json({ error: `bio must be fewer than 500 characters` })
    } 

    if(skills) {
      let skillError = UsersService.validateSkills(skills)
      if (skillError) {
        return res.status(400).json({error: skillError})
      }
      let validSkills = skills.filter(item => {
        return /\S/.test(item); 
      })
      updatedUser.skills = validSkills
    }

    // update the user
    await UsersService.updateItem(db, user_id, updatedUser);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
