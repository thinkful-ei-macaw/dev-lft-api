BEGIN;

TRUNCATE "requests", "vacancies", "projects", "users" RESTART IDENTITY CASCADE;

-- all the seed users passwords are 'pass'
INSERT INTO "users" ("id", "username", "password", "first_name", "last_name", "github_url", "linkedin_url")
VALUES
  (
    1,
    'kshncodes',
    '$2a$10$F4Yqsb9/D.pUEY0cXoWM3O0CmTRQzp4peqykZSIBHj8xJaxoY6XSS',
    'Malcolm',
    'Kiano',
    'https://github.com/malcolmkiano',
    'https://www.linkedin.com/in/malcolmkiano'
  ),
  (
    2,
    'saraquail',
    '$2a$10$F4Yqsb9/D.pUEY0cXoWM3O0CmTRQzp4peqykZSIBHj8xJaxoY6XSS',
    'Sara',
    'Mills',
    'https://www.github.com/saraquail',
    'https://www.linkedin.com/in/sararmills'
  ),
  (
    3,
    'muhiddindc',
    '$2a$10$F4Yqsb9/D.pUEY0cXoWM3O0CmTRQzp4peqykZSIBHj8xJaxoY6XSS',
    'Muhiddin',
    'Kurbonov',
    'https://www.github.com/muhiddinsgithub',
    'https://www.linkedin.com/in/muhiddin-kurbonov'
  ),
  (
    4,
    'jacklansing',
    '$2a$10$F4Yqsb9/D.pUEY0cXoWM3O0CmTRQzp4peqykZSIBHj8xJaxoY6XSS',
    'Jack',
    'Lansing',
    'https://www.github.com/jacklansing',
    'https://www.linkedin.com/in/jacklans'
  ),
  (
    5,
    'atwb21786',
    '$2a$10$F4Yqsb9/D.pUEY0cXoWM3O0CmTRQzp4peqykZSIBHj8xJaxoY6XSS',
    'Andrew',
    'Burchett',
    'https://www.github.com/atwb21786',
    'https://www.linkedin.com/in/andrew-burchett-67a41856'
  ),
  (
    6,
    'jknox24',
    '$2a$10$F4Yqsb9/D.pUEY0cXoWM3O0CmTRQzp4peqykZSIBHj8xJaxoY6XSS',
    'Jordan',
    'Knox',
    'https://www.github.com/jknox24',
    'https://www.linkedin.com/in/jtknox'
  );

INSERT INTO "projects" ("id", "name", "description", "creator_id", "tags", "github_url")
VALUES 
  (
    1,
    'CSS Legends',
    'A game to build your knowledge of CSS, and conquer the world... kinda.',
    1,
    ARRAY [ 'React', 'JavaScript', 'CSS', 'Game Development' ],
    'https://github.com/malcolmkiano/css-legends'
  ),
  (
    2,
    'Dev LFT Mobile App',
    'Build the perfect team to conquer your side projects with DevLFT!',
    3,
    ARRAY [ 'React Native', 'Android', 'iOS' ],
    'https://github.com/thinkful-ei-macaw/dev-lft'
  );

INSERT INTO "vacancies" ("id", "project_id", "user_id", "title", "description", "skills")
VALUES
  (
    1,
    1,
    2,
    'Front-end Engineer',
    'Responsible for building the user-facing application',
    ARRAY [ 'React', 'JavaScript', 'CSS', 'Dev-ops' ]
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

INSERT INTO "requests" ("id", "vacancy_id", "user_id", "status")
VALUES 
  ( 1, 1, 2, 'approved' ),
  ( 2, 2, 3, 'approved' ),
  ( 3, 3, 4, 'denied' ),
  ( 4, 3, 5, 'pending' ),
  ( 5, 3, 6, 'pending' ),
  ( 6, 4, 1, 'denied' ),
  ( 7, 4, 2, 'pending' ),
  ( 8, 5, 3, 'pending' );

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('users_id_seq', (SELECT MAX(id) from "users"));
SELECT setval('projects_id_seq', (SELECT MAX(id) from "projects"));
SELECT setval('vacancies_id_seq', (SELECT MAX(id) from "vacancies"));
SELECT setval('requests_id_seq', (SELECT MAX(id) from "requests"));

COMMIT;