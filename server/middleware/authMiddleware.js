const jwt = require('jsonwebtoken');
const User = require('../models/User');
const memory = require('../memory/db');

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    if (process.env.MEMORY_DB === '1') {
      const user = memory.findUserById(decoded.id);
      req.user = memory.publicUser(user);
    } else {
      req.user = await User.findById(decoded.id).select('-password');
    }
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

module.exports = { protect };
