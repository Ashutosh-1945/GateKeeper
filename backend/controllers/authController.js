const { auth } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If no token, proceed as guest (req.user = null)
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    // If token is invalid, treat as guest or return 401?
    // For "my-links" we need valid user. For create, guest is ok.
    // Let's set user to null if invalid, and let controller decide.
    req.user = null;
    next();
  }
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

module.exports = { verifyToken, requireAuth };
