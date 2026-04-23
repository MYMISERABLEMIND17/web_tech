const User = require('../models/User');
const Post = require('../models/Post');
const memory = require('../memory/db');

// GET /api/users/:id
exports.getProfile = async (req, res) => {
  try {
    if (process.env.MEMORY_DB === '1') {
      const user = memory.findUserById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(memory.publicUser(user));
    } else {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id
exports.updateProfile = async (req, res) => {
  try {
    if (req.params.id !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    const allowed = ['name', 'bio', 'college', 'branch', 'year', 'skills', 'avatar'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (process.env.MEMORY_DB === '1') {
      const user = memory.updateUserById(req.params.id, updates);
      res.json(memory.publicUser(user));
    } else {
      const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true, runValidators: true,
      }).select('-password');
      res.json(user);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id/posts
exports.getUserPosts = async (req, res) => {
  try {
    if (process.env.MEMORY_DB === '1') {
      res.json(memory.postsByAuthor(req.params.id));
    } else {
      const posts = await Post.find({ author: req.params.id })
        .populate('author', 'name username college avatar')
        .sort({ createdAt: -1 });
      res.json(posts);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};