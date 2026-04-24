const User = require('../models/User');
const Post = require('../models/Post');
const memory = require('../memory/db');

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    if (process.env.MEMORY_DB === '1') {
      res.json(memory.listUsers());
    } else {
      const users = await User.find({}).select('-password');
      res.json(users);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

// POST /api/users/:id/connect
exports.toggleConnection = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const targetId = req.params.id;

    if (userId === targetId) {
      return res.status(400).json({ message: "You cannot connect with yourself" });
    }

    if (process.env.MEMORY_DB === '1') {
      const result = memory.toggleConnection(userId, targetId);
      if (!result) return res.status(404).json({ message: "User not found" });
      res.json({ message: "Request toggled", sentRequests: result.userSentRequests });
    } else {
      const user = await User.findById(userId);
      const target = await User.findById(targetId);

      if (!user || !target) {
        return res.status(404).json({ message: "User not found" });
      }

      const isSent = user.sentRequests.includes(targetId);

      if (isSent) {
        user.sentRequests.pull(targetId);
        target.connectionRequests.pull(userId);
      } else {
        user.sentRequests.push(targetId);
        target.connectionRequests.push(userId);
      }

      await user.save();
      await target.save();

      res.json({ message: isSent ? "Request Withdrawn" : "Request Sent", sentRequests: user.sentRequests });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/:id/accept
exports.acceptConnection = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const targetId = req.params.id;

    if (process.env.MEMORY_DB === '1') {
      const result = memory.acceptConnection(userId, targetId);
      if (!result) return res.status(404).json({ message: "User not found" });
      res.json({ message: "Request accepted", connections: result.userConnections, connectionRequests: result.userConnectionRequests });
    } else {
      const user = await User.findById(userId);
      const target = await User.findById(targetId);

      if (!user || !target) return res.status(404).json({ message: "User not found" });

      user.connectionRequests.pull(targetId);
      target.sentRequests.pull(userId);

      if (!user.connections.includes(targetId)) user.connections.push(targetId);
      if (!target.connections.includes(userId)) target.connections.push(userId);

      await user.save();
      await target.save();

      res.json({ message: "Request accepted", connections: user.connections, connectionRequests: user.connectionRequests });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/:id/reject
exports.rejectConnection = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const targetId = req.params.id;

    if (process.env.MEMORY_DB === '1') {
      const result = memory.rejectConnection(userId, targetId);
      if (!result) return res.status(404).json({ message: "User not found" });
      res.json({ message: "Request rejected", connectionRequests: result.userConnectionRequests });
    } else {
      const user = await User.findById(userId);
      const target = await User.findById(targetId);

      if (!user || !target) return res.status(404).json({ message: "User not found" });

      user.connectionRequests.pull(targetId);
      target.sentRequests.pull(userId);

      await user.save();
      await target.save();

      res.json({ message: "Request rejected", connectionRequests: user.connectionRequests });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/me/requests
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    if (process.env.MEMORY_DB === '1') {
      res.json(memory.getMyRequests(userId));
    } else {
      const user = await User.findById(userId).populate('connectionRequests', 'name avatar');
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user.connectionRequests);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};