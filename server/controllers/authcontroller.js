const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sanitizeUser = (user) => ({
  _id:     user._id,
  name:    user.name,
  email:   user.email,
  username:user.username,
  college: user.college,
  branch:  user.branch,
  year:    user.year,
  bio:     user.bio,
  avatar:  user.avatar,
  skills:  user.skills,
  connections: user.connections,
});

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, college, branch, year } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, college, branch, year });
    res.status(201).json({ user: sanitizeUser(user), token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ user: sanitizeUser(user), token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};