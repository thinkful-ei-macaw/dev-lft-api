const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeExpectedProject(project) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    tags: project.tags,
    live_url: project.live_url,
    trello_url: project.trello_url,
    github_url: project.github_url,
    date_created: project.date_created.toISOString()
  };
}

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      password: 'testPass123!',
      first_name: 'Test FN1',
      last_name: 'Test LN1',
      github_url: 'https://github.com',
      linkedin_url: 'https://linkedin.com'
    },
    {
      id: 2,
      username: 'test-user-2',
      password: 'testPass123!',
      first_name: 'Test FN2',
      last_name: 'Test LN2'
    },
    {
      id: 3,
      username: 'test-user-3',
      password: 'testPass123!',
      first_name: 'Test FN3',
      last_name: 'Test LN3'
    },
    {
      id: 4,
      username: 'test-user-4',
      password: 'testPass123!',
      first_name: 'Test FN4',
      last_name: 'Test LN4'
    }
  ];
}

function makeProjectsArray(users) {
  return [
    {
      id: 1,
      name: 'Test Proj 1',
      creator_id: users[0].id,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
    },
    {
      id: 2,
      name: 'Test Proj 2',
      creator_id: users[1].id,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
    },
    {
      id: 3,
      name: 'Test Proj 3',
      creator_id: users[2].id,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
    }
  ];
}

function makeVacanciesArray(users, projects) {
  return [
    {
      id: 1,
      project_id: projects[0].id,
      user_id: users[0].id,
      title: 'Test vacancy 1',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
    },
    {
      id: 2,
      project_id: projects[1].id,
      user_id: users[1].id,
      title: 'Test vacancy 2',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
    },
    {
      id: 3,
      project_id: projects[2].id,
      user_id: users[2].id,
      title: 'Test vacancy 3',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
    }
  ];
}

function makeRequestsArray(users, vacancies) {
  return [
    {
      id: 1,
      vacancy_id: vacancies[0].id,
      user_id: users[0].id,
      status: 'pending'
    },
    {
      id: 2,
      vacancy_id: vacancies[1].id,
      user_id: users[1].id,
      status: 'denied'
    },
    {
      id: 3,
      vacancy_id: vacancies[2].id,
      user_id: users[2].id,
      status: 'approved'
    }
  ];
}

function makePostsArray(users, projects) {
  return [
    {
      id: 1,
      project_id: projects[0].id,
      user_id: users[0].id,
      message: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
    },
    {
      id: 2,
      project_id: projects[1].id,
      user_id: users[1].id,
      message: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
    },
    {
      id: 3,
      project_id: projects[2].id,
      user_id: users[2].id,
      message: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
    }
  ];
}

function makeChatsArray(users, projects) {
  return [
    {
      id: 1,
      project_id: projects[0].id,
      author_id: users[0].id,
      recipient_id: users[1].id
    },
    {
      id: 2,
      project_id: projects[1].id,
      author_id: users[1].id,
      recipient_id: users[2].id
    },
    {
      id: 3,
      project_id: projects[2].id,
      author_id: users[2].id,
      recipient_id: users[3].id
    }
  ];
}

function makeMessagesArray(users, chats) {
  return [
    {
      id: 1,
      chat_id: chats[0].id,
      author_id: users[0].id,
      body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
    },
    {
      id: 2,
      chat_id: chats[1].id,
      author_id: users[1].id,
      body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
    },
    {
      id: 3,
      chat_id: chats[2].id,
      author_id: users[2].id,
      body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
    }
  ];
}

function makeNotificationsArray(users, projects) {
  return [
    {
      id: 1,
      recipient_id: users[0].id,
      project_id: projects[0].id,
      type: 'join'
    },
    {
      id: 2,
      recipient_id: users[1].id,
      project_id: projects[1].id,
      type: 'leave'
    },
    {
      id: 3,
      recipient_id: users[2].id,
      project_id: projects[2].id,
      type: 'post'
    },
    {
      id: 4,
      recipient_id: users[0].id,
      project_id: projects[2].id,
      type: 'chat'
    }
  ];
}

function seedUsers(db, users) {
  const usersHashedPw = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));

  return db
    .into('users')
    .insert(usersHashedPw)
    .then(() =>
      //update autoseqencer
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function seedProjectsTables(
  db,
  users,
  projects,
  vacancies,
  requests,
  posts,
  chats,
  messages,
  notifications
) {
  let tables = {
    projects,
    vacancies,
    requests,
    posts,
    chats,
    messages,
    notifications
  };

  return db.transaction(async trx => {
    await seedUsers(trx, users);
    for (const key in tables) {
      if (tables[key]) {
        await trx.into(`${key}`).insert(tables[key]);
        await trx.raw(`SELECT setval('${key}_id_seq', ?)`, [
          tables[key][tables[key].length - 1].id
        ]);
      }
    }
  });
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
          users
          RESTART IDENTITY CASCADE
        `
    )
  );
}

function makeFixtures() {
  const testUsers = makeUsersArray();
  const testProjects = makeProjectsArray(testUsers);
  const testVacancies = makeVacanciesArray(testUsers, testProjects);
  const testRequests = makeRequestsArray(testUsers, testVacancies);
  const testPosts = makePostsArray(testUsers, testProjects);
  const testChats = makeChatsArray(testUsers, testProjects);
  const testMessages = makeMessagesArray(testUsers, testChats);
  const testNotifications = makeNotificationsArray(testUsers, testProjects);

  return {
    testUsers,
    testRequests,
    testProjects,
    testVacancies,
    testPosts,
    testChats,
    testMessages,
    testNotifications
  };
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256'
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeProjectsArray,
  makeVacanciesArray,
  makeRequestsArray,
  makePostsArray,
  makeChatsArray,
  makeMessagesArray,
  makeNotificationsArray,

  makeAuthHeader,
  makeFixtures,
  seedProjectsTables,
  cleanTables
};
