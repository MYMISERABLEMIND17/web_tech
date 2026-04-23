const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:  { type: String, required: true, maxlength: 280 },
  image:    { type: String, default: null },
  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text:      { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
