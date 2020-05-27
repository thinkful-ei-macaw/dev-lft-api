# Dev LFT

## Set up

If using postgres user `postgres`:

```
mv example.env .env
createdb -U postgres dev-lft
createdb -U psotgres dev-lft-test
```

If your `postgres` user has a password be sure to set it in `.env` for all appropriate fields. Or if using a different user, update appropriately.

```
npm install
npm run migrate
env MIGRATION_DB_NAME=dev-lft-test npm run migrate
```

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

Run the linter `npm run lint`

Run prettier formatting `npm run format`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.
