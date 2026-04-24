const jwt = require('jsonwebtoken');
const User = require('../models/User');
const memory = require('../memory/db');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sanitizeUser = (user) => ({
  _id: user._id, name: user.name, email: user.email, username: user.username,
  college: user.college, branch: user.branch, year: user.year,
  bio: user.bio, avatar: user.avatar, skills: user.skills, 
  connections: user.connections, connectionRequests: user.connectionRequests, sentRequests: user.sentRequests
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, college, branch, year } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (process.env.MEMORY_DB === '1') {
      if (memory.findUserByEmail(email))
        return res.status(400).json({ message: 'Email already registered' });
      const user = await memory.createUser({ name, email, password, college, branch, year });
      res.status(201).json({ user: sanitizeUser(user), token: generateToken(user._id) });
    } else {
      if (await User.findOne({ email }))
        return res.status(400).json({ message: 'Email already registered' });
      const user = await User.create({ name, email, password, college, branch, year });
      res.status(201).json({ user: sanitizeUser(user), token: generateToken(user._id) });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (process.env.MEMORY_DB === '1') {
      const user = memory.findUserByEmail(email);
      if (!user || !(await memory.matchPassword(user, password)))
        return res.status(401).json({ message: 'Invalid email or password' });
      res.json({ user: sanitizeUser(user), token: generateToken(user._id) });
    } else {
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password)))
        return res.status(401).json({ message: 'Invalid email or password' });
      res.json({ user: sanitizeUser(user), token: generateToken(user._id) });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMe = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};
