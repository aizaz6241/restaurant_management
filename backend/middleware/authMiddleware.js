const protectAdmin = (req, res, next) => {
  let token;

  // Check header for Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Fallback to simple x-auth-token header
  if (!token && req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  const expectedToken = 'sher-afghan-admin-session-token';

  if (token === expectedToken) {
    req.admin = { username: process.env.ADMIN_USERNAME || 'admin' };
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { protectAdmin };
