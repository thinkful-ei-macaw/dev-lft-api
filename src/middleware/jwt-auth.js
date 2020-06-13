const AuthService = require('../auth/auth-service');

async function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';
  const db = req.app.get('db');

  let bearerToken;
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  try {
    const payload = AuthService.verifyJwt(bearerToken);
    const username = payload.sub;
    const user = await AuthService.getItemWhere(db, { username });
    if (!user) return res.status(401).json({ error: 'Unauthorized request' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
}

async function checkAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';
  const db = req.app.get('db');

  let bearerToken;
  if (!authToken.toLowerCase().startsWith('bearer ') || !authToken) {
    req.user = null;
    return next();
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  try {
    const payload = AuthService.verifyJwt(bearerToken);
    const username = payload.sub;
    const user = await AuthService.getItemWhere(db, { username });
    req.user = user ? user : null;
    next();
  } catch (error) {
    req.user = null;
    next(error);
  }
}

module.exports = {
  requireAuth,
  checkAuth
};
