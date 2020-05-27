require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

// import routers
const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');

// set up routes
const routes = [
  { url: '/api/auth', router: authRouter },
  { url: '/api/users', router: usersRouter }
];

// add routes to app
routes.forEach(({ url, router }) => {
  app.use(url, router);
});

// base route for happiness
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.essage, error };
  }
  res.status(500).json(response);
});

module.exports = app;
