module.exports = {
  PORT: process.env.PORT || 8000,
  CLIENT_ORIGIN: [
    'https://www.devlft.com',
    'https://devlft.com',
    'https://devlft.now.sh/',
    'http://localhost:3000'
  ],
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL || 'postgresql://postgres@localhost/dev-lft',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret'
};
