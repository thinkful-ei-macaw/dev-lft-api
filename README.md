# Dev LFT

## What is Dev LFT?

Dev LFT is a platform that brings together software engineers, web developers and web designers to build perfect teams to conquer side projects.

## Installing

Dev LFT requires Node.js v12.14+ and npm 6.14+ to run.
Install the dependencies and devDependencies and start the server.

```
npm install
```

## Running the tests

To run tests, simply run `npm test` in the terminal.

## API Overview

```text
/api
.
├── /auth
│   └── POST
│       └── /login
├── /users
│   └── GET
│       ├── /:username
│       ├── /profile
│   └── POST
│       └── /
│   └── PATCH
│       └── /
├── /projects
│   └── GET
│       ├── /
│       ├── /user
│       ├── /:project_handle
│   └── POST
│       └── /
│   └── DELETE
│       └── /:project_id
├── /requests
│   └── GET
│       └── /:project_id
│   └── POST
│       └── /:vacancy_id
│   └── PATCH
│       └── /:id
├── /vacancies
│   └── GET
│       └── /:project_id
│   └── POST
│       └── /:project_id
│   └── PATCH
│       └── /:id
│   └── DELETE
│       └── /:id
├── /chats
│   └── GET
|       └── /
|       └── /:chat_id
│   └── POST
│       └── /
│   └── PATCH
│       └── /:chat_id
├── /posts
│   └── GET
|       └── /:project_id
│   └── POST
│       └── /:project_id
│   └── PATCH
│       └── /:id
├── /notifications
│   └── GET
│       └── /
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

### GET `/api/users/profile`

```js
// res.body
{
  "username": String,
  "first_name": String,
  "last_name": String,
  "github_url": String,
  "linkedin_url": String,
  "twitter_url": String,
  "bio": String,
  "skills": [String],
  "notifications": [String],
  "date_created": String
}
```

### GET `/api/users/:username`

```js
// req.params
{
  username: String
}

// res.body
{
  "username": String,
  "first_name": String,
  "last_name": String,
  "github_url": String,
  "linkedin_url": String,
  "twitter_url": String,
  "bio": String,
  "skills": [String],
  "notifications": [String],
  "date_created": String
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

### PATCH `/api/users/`

```js
// req.body

{
  first_name: String,
  last_name: String,
  github_url: String,
  linkedin_url: String,
  twitter_url: String,
  bio: String,
  skills: [String],
  notifications: [String]
}

// res.body

{
  status: 204
}
```

### GET `/api/projects/`

```js
// res.body

[
  {
    id: String,
    name: String,
    description: String,
    tags: [String],
    live_url: String,
    trello_url: String,
    github_url: String,
    date_created: String,
    handle: String,
    openVacancies: String,
  },
];
```

### GET `/api/projects/user/`

```js
// res.body

[
  {
    id: String,
    name: String,
    description: String,
    tags: [String],
    live_url: String,
    trello_url: String,
    github_url: String,
    date_created: String,
    handle: String,
    openVacancies: String,
  },
];
```

### GET `/api/projects/:project_handle`

```js
// req.params

{
  project_handle: String;
}

// res.body

{
    id: Number,
    name: String,
    description: String,
    tags: [String],
    live_url: String,
    trello_url: String,
    github_url: String,
    date_created: String,
    userRole: String,
    handle: String,
    openVacancies: String,
    project_creator: {
        first_name: String,
        last_name: String,
        username: String
    }
}
```

### POST `/api/projects/`

```js
// req.body

{
  name: String,
  description: String,
  tags: [String],
  live_url: String,
  trello_url: String,
  github_url: String
}

// res.body

  {
    id: String,
    name: String,
    description: String,
    tags: [String],
    live_url: String,
    trello_url: String,
    github_url: String,
    date_created: String,
    handle: String
  }
```

### DELETE `/api/projects/:project_id`

```js
// req.params
{
  project_id: Number;
}

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
    username: String,
    status: String,
    project_id: Number,
    first_name: String,
    last_name: String,
  },
];
```

### POST `/api/requests/:vacancy_id`

```js
// req.params
{
  vacancy_id: Number;
}
// res.body

{
    id: Number,
    vacancy_id: Number,
    user_id: Number,
    status: String,
    date_created: String
}
```

### PATCH `/api/requests/:id`

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

### GET `/api/vacancies/:project_id`

```js
// req.params
{
  project_id: Number;
}

// res.body

[
  {
    id: Number,
    project_id: Number,
    request_status: String,
    first_name: String,
    last_name: String,
    username: String,
    title: String,
    description: String,
    skills: [String],
  },
];
```

### POST `/api/vacancies/:project_id`

```js
// req.body
{
  title: String,
  description: String,
  skills: [String]
}
//req.params
{
  project_id: Number
}

// res.body

{
  id: Number,
  project_id: Number,
  title: String,
  description: String,
  skills: [String]
}
```

### PATCH `/api/vacancies/:id`

```js
// req.body
{
  title: String,
  description: String,
  skills: [String],
  user_id: Number
}
//req.params.id
  vacancy_id: Number

// res.body

{
  status: 204
}
```

### DELETE `/api/vacancies/:id`

```js
//req.params.id
vacancy_id: Number;

// res.body
{
  status: 204;
}
```

### GET `/api/chats/:chat_id`

```js
//req.params
{
  chat_id: Number;
}
// res.body
{
  allMessages: [
    {
      body: String,
      date_created: String,
      author_username: String,
      isAuthor: Boolean,
    },
  ];
}
```

### POST `/api/chats/`

```js
// req.body
{
  recipient_username: String,
  request_id: Number,
  body: String
}
// res.body

{
  resultingMessage: {
    id: Number,
    chat_id: Number,
    author_id: Number,
    body: String,
    date_created: String
  }
}
```

### PATCH `/api/chats/:chat_id`

```js
// req.body
{
  closed: Boolean;
}
// req.params
{
  chat_id: Number;
}
// req.user.id
user_id: Number;

// res.body
{
  status: 204;
}
```

### GET `/api/posts/:project_id`

```js
// req.params
{
  project_id: Number;
}
// res.body

[
  {
    id: Number,
    message: String,
    date_created: String,
    first_name: String,
    last_name: String,
    user_name: String,
    canEdit: Boolean,
  },
];
```

### POST `/api/posts/:project_id`

```js
// req.params
{
  project_id: Number;
}
// req.user.id
  user_id: Number;
// req.body
{
  message: String;
}
//res.body

{
  id: Number,
  message: String,
  date_created: String,
  canEdit: Boolean
}
```

### PATCH `/api/posts/:post_id`

```js
// req.params.id
post_id: Number;
// req.body
{
  message: String;
}
// res.body
{
  status: 204;
}
```

### GET `/api/notifications/`

```js
// req.user.id
recipient_id: Number;

// res.body
[
  {
    type: String,
    seen: Boolean,
    date_created: String,
    name: String,
    handle: String,
  },
];
```

### PATCH `/api/notifications/:notification_id`

```js
// req.params
{
  recipient_id: Number;
}
{
  seen: Boolean;
}

// res.body
{
  status: 204;
}
```

## Tech Stack

- [Node](https://nodejs.org/en/) - Asynchronous event-driven JavaScript runtime
- [Express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
- [PostgreSQL](https://www.postgresql.org/) - The World's Most Advanced Open Source Relational Database
- [Knex](http://knexjs.org/) - SQL query builder
- [JWT](https://jwt.io/) - Authentication
- [Mocha](https://mochajs.org/) - A feature-rich JavaScript test framework
- [Chai](https://www.chaijs.com/) - BDD/TDD assertion library for node and the browser

## Authors

- Project Manager - [Malcolm Kiano](https://github.com/malcolmkiano)
- Product Manager - [Sara Mills](https://github.com/Saraquail)
- QA Lead - [Jack Lansing](https://github.com/jacklansing)
- Design Lead - [Andrew Burchett](https://github.com/atwb21786)
- Documentation Manager - [Muhiddin Kurbonov](https://github.com/muhiddinsgithub)

See also the list of [contributors](https://github.com/thinkful-ei-macaw/dev-lft-api/graphs/contributors) who participated in this project.

## Acknowledgments

- Andrea Bailey, Joe Turner, Rich Greenhill, Tauhida Parveen, Capi Etheriel, Brandon Hinshaw, Rhonda Bell, Luke Rossie
