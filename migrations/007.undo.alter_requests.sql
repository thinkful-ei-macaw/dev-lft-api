BEGIN;

ALTER TABLE IF EXISTS requests
RENAME COLUMN vacancy_id TO vacancies_id;

ALTER TABLE IF EXISTS requests
DROP COLUMN project_id;

COMMIT;