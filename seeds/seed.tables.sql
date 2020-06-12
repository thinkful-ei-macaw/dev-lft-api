BEGIN;

  TRUNCATE "requests", "vacancies", "projects", "users" RESTART IDENTITY CASCADE;

  -- all the seed users passwords are 'pass'
  INSERT INTO "users"
    ("id", "username", "password", "first_name", "last_name", "github_url", "linkedin_url", "bio", "skills")
  VALUES
    (
      1,
      'kshncodes',
      '$2a$10$F4Yqsb9/D.pUEY0cXoWM3O0CmTRQzp4peqykZSIBHj8xJaxoY6XSS',
      'Malcolm',
      'Kiano',
      'https://github.com/malcolmkiano',
      'https://www.linkedin.com/in/malcolmkiano',
      'Creative JavaScript developer specializing in building scalable web solutions. Passionate about accessibility, crafting great UX, and mastering SaaS.',
      ARRAY
  ['HTML', 'CSS', 'JavaScript', 'Node', 'Express', 'PostgreSQL', 'Graphic Design']
  ),
  (
    2,
    'saraquail',
    '$2a$10$F4Yqsb9/D.pUEY0cXoWM3O0CmTRQzp4peqykZSIBHj8xJaxoY6XSS',
    'Sara',
    'Mills',
    'https://www.github.com/saraquail',
    'https://www.linkedin.com/in/sararmills',
    'Full stack web developer currently honing my skills in Thinkful''s Engineering Immersion program. To me programming feels like playing a game - every time I do something new I gain experience points and eventually level up. The best part is: there''s no game overs. I can always eventually find the next step to figuring out how to solve the problem, no matter how large the problem may be (i.e. boss fight!).',
    ARRAY ['HTML', 'CSS', 'JavaScript', 'Node', 'Express', 'PostgreSQL', 'Bird Whispering']
  ),
  (
    3,
    'muhiddindc',
    '$2a$10$F4Yqsb9/D.pUEY0cXoWM3O0CmTRQzp4peqykZSIBHj8xJaxoY6XSS',
    'Muhiddin',
    'Kurbonov',
    'https://www.github.com/muhiddinsgithub',
    'https://www.linkedin.com/in/muhiddin-kurbonov',
    'A Full Stack Web Developer specialized in JavaScript technologies (Node/Express, React, PostgreSQL). Passionate about building useful/interesting web applications.',
    ARRAY ['HTML', 'CSS', 'JavaScript', 'Node', 'Express', 'PostgreSQL', 'DevOps']
  ),
  (
    4,
    'jacklansing',
    '$2a$10$F4Yqsb9/D.pUEY0cXoWM3O0CmTRQzp4peqykZSIBHj8xJaxoY6XSS',
    'Jack',
    'Lansing',
    'https://www.github.com/jacklansing',
    'https://www.linkedin.com/in/jacklans',
    NULL,
    ARRAY ['HTML', 'CSS', 'JavaScript', 'Node', 'Express', 'PostgreSQL', 'QA Management']
  ),
  (
    5,
    'atwb21786',
    '$2a$10$F4Yqsb9/D.pUEY0cXoWM3O0CmTRQzp4peqykZSIBHj8xJaxoY6XSS',
    'Andrew',
    'Burchett',
    'https://www.github.com/atwb21786',
    'https://www.linkedin.com/in/andrew-burchett-67a41856',
    NULL,
    ARRAY ['HTML', 'CSS', 'JavaScript', 'Node', 'Express', 'PostgreSQL', 'Testing Frameworks']
  ),
  (
    6,
    'jknox24',
    '$2a$10$F4Yqsb9/D.pUEY0cXoWM3O0CmTRQzp4peqykZSIBHj8xJaxoY6XSS',
    'Jordan',
    'Knox',
    'https://www.github.com/jknox24',
    'https://www.linkedin.com/in/jtknox',
    'After 7+ years as a sales and marketing leader, I''ve had the unique opportunity to develop and scale AI products, raise millions of dollars, and successfully sell the last startup I cofounded, Butter.ai, to Box.',
    ARRAY ['HTML', 'CSS', 'JavaScript', 'Node', 'Express', 'PostgreSQL', 'Sales', 'Marketing']
  ),
  (
    7,
    'demouser',
    '$2a$10$F4Yqsb9/D.pUEY0cXoWM3O0CmTRQzp4peqykZSIBHj8xJaxoY6XSS',
    'Demo',
    'User',
    'https://www.github.com/demouser',
    'https://www.linkedin.com/in/demouser',
    'Hi I''m the Demo User. I love DEV-LFT!',
    ARRAY ['HTML', 'CSS', 'JavaScript', 'Node', 'Express', 'PostgreSQL', 'Mocha', 'Chai']
  );

INSERT INTO "projects"
  ("id", "name", "description", "creator_id", "handle", "tags", "github_url")
VALUES
  (
    1,
    'CSS Legends',
    'A game to build your knowledge of CSS, and conquer the world... kinda.',
    1,
    'css-legends',
    ARRAY
[ 'React', 'JavaScript', 'CSS', 'Game Development' ],
    'https://github.com/malcolmkiano/css-legends'
  ),
(
    2,
    'Dev LFT Mobile App',
    'Build the perfect team to conquer your side projects with DevLFT!',
    3,
    'dev-lft-mobile-app',
    ARRAY [ 'React Native', 'Android', 'iOS' ],
    'https://github.com/thinkful-ei-macaw/dev-lft'
  );

INSERT INTO "vacancies"
  ("id", "project_id", "user_id", "title", "description", "skills")
VALUES
  (
    1,
    1,
    2,
    'Front-end Engineer',
    'Responsible for building the user-facing application',
    ARRAY
[ 'React', 'JavaScript', 'CSS', 'Dev-ops' ]
  ),
(
    2,
    1,
    3,
    'Back-end Engineer',
    'Responsible for building the application back-end',
    ARRAY [ 'Node', 'Express', 'PostgreSQL', 'Testing Frameworks (like Supertest and Mocha)' ]
  ),
(
    3,
    1,
    NULL,
    'Designer',
    'Responsible for creating application designs and high-fidelity mockups',
    ARRAY [ 'Graphic Design', 'UI/UX', 'Adobe CC', 'Prototyping' ]
  ),
(
    4,
    2,
    NULL,
    'Full Stack Engineer',
    'Responsible for creating a web service for the application and a landing page to point users to the app in theapp stores',
    ARRAY [ 'Node', 'Express', 'REST APIs', 'HTML', 'CSS', 'JavaScript' ]
  ),
(
    5,
    2,
    NULL,
    'Designer',
    'Responsible for creating application designs and high-fidelity mockups',
    ARRAY [ 'Graphic Design', 'UI/UX', 'Adobe CC', 'Prototyping' ]
  ),
(
    6,
    2,
    NULL,
    'Marketing Specialist',
    'Responsible for creating marketing campaigns for application promotion',
    ARRAY [ 'Communication', 'Adaptability', 'Strong attention to detail' ]
  );

INSERT INTO "requests"
  ("id", "vacancy_id", "user_id", "status")
VALUES
  ( 1, 1, 2, 'approved' ),
  ( 2, 2, 3, 'approved' ),
  ( 3, 3, 4, 'denied' ),
  ( 4, 3, 5, 'pending' ),
  ( 5, 3, 6, 'pending' ),
  ( 6, 4, 1, 'denied' ),
  ( 7, 5, 4, 'pending' ),
  ( 8, 3, 7, 'pending' ),
  ( 9, 5, 7, 'pending' );

INSERT INTO "chats"
  ("id", "request_id", "author_id", "recipient_id", "closed", "date_created")
VALUES
  ( 1, 8, 1, 7, false, now() - '10 minutes'
::INTERVAL),
( 2, 9, 3, 7, false, now
() - '20 minutes'::INTERVAL);

INSERT INTO "messages"
  ("id", "chat_id", "author_id", "body", "date_created")
VALUES
  ( 1, 1, 1, 'Hey, would you like to join our team?', now() - '20 minutes'
::INTERVAL ),
( 2, 1, 7, 'Absolutely!', now
() - '5 minutes'::INTERVAL ),
( 3, 2, 3, 'Hi! Did you know that Corgis invented electricity?', now
() - '10 minutes'::INTERVAL ),
( 4, 2, 7, 'Yes. Yes I did', now
() - '7 minutes'::INTERVAL ),
( 5, 2, 3, 'Welcome to the team.', now
() - '3 minutes'::INTERVAL);

INSERT INTO "posts"
  ("id", "project_id", "user_id", "message", "date_created")
VALUES
  (1, 1, 1, 'This is the revolution to learning CSS...', now() - '61 minutes'
::INTERVAL),
(2, 1, 1, 'Welcome to CSS Legends!', now
() - '60 minutes'::INTERVAL),
(3, 1, 2, 'Glad to be a part of the future!!', now
() - '15 minutes'::INTERVAL),
(4, 2, 3, 'Welcome all! Get ready to crush your side projects on the go with the new DevLFT mobile app!', now
() - '3 hours'::INTERVAL);

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('users_id_seq', (SELECT MAX(id)
  from "users"));
SELECT setval('projects_id_seq', (SELECT MAX(id)
  from "projects"));
SELECT setval('vacancies_id_seq', (SELECT MAX(id)
  from "vacancies"));
SELECT setval('requests_id_seq', (SELECT MAX(id)
  from "requests"));
SELECT setval('posts_id_seq', (SELECT MAX(id)
  from "posts"));
SELECT setval('chats_id_seq', (SELECT MAX(id)
  from "chats"));
SELECT setval('messages_id_seq', (SELECT MAX(id)
  from "messages"))

COMMIT;