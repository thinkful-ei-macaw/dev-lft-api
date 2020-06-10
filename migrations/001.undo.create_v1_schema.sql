BEGIN;

DROP TABLE IF EXISTS users, projects, vacancies, requests, posts, chats, messages, notifications CASCADE;
DROP TYPE IF EXISTS request_status, notification_type;

COMMIT;