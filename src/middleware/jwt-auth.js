const AuthService = require('../auth/auth-service');

async function requireAuth(req, res, next, block = true) {
  const authToken = req.get('Authorization') || '';
  const db = req.app.get('db');

  let bearerToken;
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    if (block) {
      return res.status(401).json({ error: 'Missing bearer token' });
    } else {
      req.user = null;
      return next();
    }
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  try {
    const payload = AuthService.verifyJwt(bearerToken);
    const username = payload.sub;
    const user = await AuthService.getItemWhere(db, { username });
    if (block) {
      if (!user) return res.status(401).json({ error: 'Unauthorized request' });
      req.user = user;
    } else {
      req.user = user ? user : null;
    }

    next();
  } catch (error) {
    if (block) return res.status(401).json({ error: 'Unauthorized request' });
    next(error);
  }
}

function checkAuth(req, res, next) {
  return requireAuth(req, res, next, false);
}

module.exports = {
  requireAuth,
  checkAuth
};
