const Post = require('../models/Post');
const memory = require('../memory/db');
const crypto = require('crypto');

// GET /api/posts
exports.getPosts = async (req, res) => {
  try {
    const page  = parseInt(req.query.page) || 1;
    const limit = 10;
    if (process.env.MEMORY_DB === '1') {
      const all = memory.listPosts().map(memory.populatePostAuthor);
      const start = (page - 1) * limit;
      res.json(all.slice(start, start + limit));
    } else {
      const posts = await Post.find()
        .populate('author', 'name username college avatar')
        .populate('comments.user', 'name username avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      res.json(posts);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let image = req.body.image || null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }
    
    if (!content) return res.status(400).json({ message: 'Content is required' });
    if (process.env.MEMORY_DB === '1') {
      const post = memory.createPost({ authorId: req.user._id, content, image });
      res.status(201).json(memory.populatePostAuthor(post));
    } else {
      const post = await Post.create({ author: req.user._id, content, image });
      await post.populate('author', 'name username college avatar');
      res.status(201).json(post);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/posts/:id/comments
exports.addComment = async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    if (process.env.MEMORY_DB === '1') {
      const post = memory.findPostById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      const comment = {
        _id: crypto.randomUUID(),
        user: req.user._id,
        text,
        createdAt: new Date().toISOString(),
      };
      post.comments.push(comment);
      post.updatedAt = new Date().toISOString();
      return res.status(201).json(memory.populatePostAuthor(post));
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user._id, text });
    await post.save();

    await post.populate('author', 'name username college avatar');
    await post.populate('comments.user', 'name username avatar');
    return res.status(201).json(post);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/posts/:id/like
exports.likePost = async (req, res) => {
  try {
    if (process.env.MEMORY_DB === '1') {
      const post = memory.findPostById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      const likes = memory.toggleLike(post, req.user._id);
      res.json({ likes });
    } else {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      const liked = post.likes.includes(req.user._id);
      if (liked) {
        post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
      } else {
        post.likes.push(req.user._id);
      }
      await post.save();
      res.json({ likes: post.likes });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    if (process.env.MEMORY_DB === '1') {
      const post = memory.findPostById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      if (String(post.author) !== String(req.user._id))
        return res.status(403).json({ message: 'Not authorized' });
      memory.deletePostById(req.params.id);
      res.json({ message: 'Post deleted' });
    } else {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      if (post.author.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Not authorized' });
      await post.deleteOne();
      res.json({ message: 'Post deleted' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};