# Dev LFT

## What is Dev LFT?

Dev LFT is a platform that brings together software engineers, web developers and web designers to build perfect teams to conquer side projects.

## Prerequisites

Dev LFT requires Node.js v6.0+ to run.

## Installing

Dev LFT requires Node.js v12.14+ and npm 6.14+ to run.
Install the dependencies and devDependencies and start the server.

```
npm install
```

## Running the tests

To run front-end or back-end tests, simply run `npm test` in the terminal.

## API Overview

```text
/api
.
├── /auth
│   └── POST
│       └── /login
├── /users
│   └── GET
│       ├── /:user_id
│   └── POST
│       └── /
│   └── PATCH
│       └── /:user_id
├── /projects
│   └── GET
│       ├── /
│       ├── /user
│       ├── /:project_id
│   └── POST
│       └── /
│   └── PATCH
│       └── /:project_id
│   └── DELETE
│       └── /:project_id
├── /requests
│   └── GET
│       └── /:project_id
│   └── POST
│       └── /:vacancy_id
│   └── PATCH
│       └── /:request_id
├── /vacancies
│   └── GET
│       └── /:project_id
│   └── POST
│       └── /:project_id
│   └── PATCH
│       └── /:vacancy_id
│   └── DELETE
│       └── /:vacancy_id
├── /chats
│   └── GET
|       └── /:chat_id
│   └── POST
│       └── /
│   └── PATCH
│       └── /:chat_id
│       └── /:post_id
├── /posts
│   └── GET
|       └── /:project_id
│   └── POST
│       └── /:project_id
│   └── PATCH
│       └── /:post_id
├── /notifications
│   └── GET
│   └── PATCH
│       └── /:notification_id
```

### POST `/api/auth/login`

```js
// req.body
{
  username: String,
  password: String
}

// res.body
{
  authToken: String
}
```

### GET `/api/users/`

```js
// req.query
{
  ?
}

// res.body
{
  count: Number
}
```

### GET `/api/users/:user_id`

```js
// req.params
{
  user_id: ID
}

// res.body
{
    username: String,
    first_name: String,
    last_name: String,
    github_url: String,
    linkedin_url: String,
    twitter_url: String,
    date_created: String
}
```

### POST `/api/users/`

```js
// req.body
{
  username: String,
  password: String,
  first_name: String,
  last_name: String
}

// res.body
{
  authToken: String
}
```

### PATCH `/api/users/:user_id`

```js
// req.body

{
  first_name: String,
  last_name: String,
  github_url: String,
  linkedin_url: String,
  twitter_url: String
}

// res.body

{
  status: 204
}
```

### GET `/api/projects/`

```js
// req.query
{
  ?
}

// res.body

[
  {
    id: String,
    name: String,
    creator: String,
    description: String,
    tags: [],
    live_url: String,
    trello_url: String,
    github_url: String,
    date_created: String
  }, ...
]
```

### GET `/api/projects/user/`

```js
// req.user.id

{
  user_id: Number;
}

// res.body

[
  {
    id: String,
    name: String,
    creator: String,
    description: String,
    tags: [],
    live_url: String,
    trello_url: String,
    github_url: String,
    date_created: String
  }, ...
]
```

### GET `/api/projects/:project_id`

```js
// req.params

{
  project_id: Number;
}

// res.body

  {
    id: String,
    name: String,
    creator: String,
    description: String,
    tags: [],
    live_url: String,
    trello_url: String,
    github_url: String,
    date_created: String
  }
```

### POST `/api/projects/`

```js
// req.body

{
  name: String,
  description: String,
  tags: [],
  live_url: String,
  trello_url: String,
  github_url: String
}

// res.body

  {
    id: String,
    name: String,
    creator: String,
    description: String,
    tags: [],
    live_url: String,
    trello_url: String,
    github_url: String,
    date_created: String
  }
```

### PATCH `/api/projects/:project_id`

```js
// req.body

{
  name: String,
  description: String,
  tags: [],
  live_url: String,
  trello_url: String,
  github_url: String
}

// req.params
{
  project_id: Number
}

//res.body

{
  status: 204
}
```

### DELETE `/api/projects/:project_id`

```js
// req.params
{
  project_id: Number;
}
// req.user.id
creator_id: Number;

// res.body

{
  status: 204;
}
```

### GET `/api/requests/:project_id`

```js
// req.params

{
  project_id: Number;
}

// res.body
[
  {
    id: Number,
    vacancy_id: Number,
    vacancy_title: String,
    user_id: Number,
    status: String,
    project_id: Number,
    first_name: String,
    last_name: String,
  }, ...
];
```

### POST `/api/requests/:vacancy_id`

```js
// req.params
{
  vacancy_id: Number;
}
// req.user.id
user_id: Number;

// res.body

//fill in here with res.body
```

### PATCH `/api/requests/:vacancy_id`

```js
// req.params
{
  request_id: Number;
}
// req.body
{
  status: String;
}

// res.body

{
  status: 204;
}
```

## Built With

- [Node](https://nodejs.org/en/) - Run-time environment
- [Express](https://expressjs.com/) - Web application framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Knex](http://knexjs.org/) - SQL query builder
- [JWT](https://jwt.io/) - Authentication
- [Mocha](https://mochajs.org/) - Testing
- [Chai](https://www.chaijs.com/) - Testing

## Authors

- **Malcolm Kiano** - _Full-Stack_ - [malcolmkiano](https://github.com/malcolmkiano)

- **Sara Mills** - _Full-Stack_ - [saraquail](https://github.com/Saraquail)

- **Jack Lansing** - _Full-Stack_ - [jackLansing](https://github.com/jacklansing)

- **Andrew Burchett** - _Full-Stack_ - [atwb21786](https://github.com/atwb21786)

- **Muhiddin Kurbonov** - _Full-Stack_ - [muhiddinsgithub](https://github.com/muhiddinsgithub)

See also the list of [contributors](https://github.com/thinkful-ei24/buvie-server/graphs/contributors) who participated in this project.

## Acknowledgments

- Andrea Bailey, Joe Turner, Rich Greenhill, Tauhida Parveen, Capi Etheriel, Brandon Hinshaw, Rhonda Bell, Luke Rossie
