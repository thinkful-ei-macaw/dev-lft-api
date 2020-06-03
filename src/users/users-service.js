const Service = require('../base-service');
const bcrypt = require('bcryptjs');
const xss = require('xss');

const REGEX_ALPHA_NO_SPACES_OR_NUMBERS = /^[A-Za-z'-]+$/;
const REGEX_UPPER_LOWER_NUMBER = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])+/;

class UsersService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  validateName(name) {
    name = name.toString();
    if (name.length < 2) {
      return 'must be 2 or more characters';
    }

    if (name.length > 30) {
      return 'must be less than 30 characters';
    }

    if (!REGEX_ALPHA_NO_SPACES_OR_NUMBERS.test(name)) {
      return 'must contain only alphabetic characters and no spaces';
    }
  }

  validatePassword(password) {
    password = password.toString();
    if (password.length < 8) {
      return 'Password must be 8 or more characters';
    }

    if (password.length > 72) {
      return 'Password must be less than 72 characters';
    }

    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }

    if (!REGEX_UPPER_LOWER_NUMBER.test(password)) {
      return 'Password must contain at least 1 uppercase, lowercase and number characters';
    }
  }

  hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  serializeUser(user) {
    return {
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      github_url: xss(user.github_url),
      linkedin_url: xss(user.linkedin_url),
      twitter_url: xss(user.twitter_url),
      date_created: new Date(user.date_created).toISOString()
    };
  }
}

module.exports = new UsersService('users');
