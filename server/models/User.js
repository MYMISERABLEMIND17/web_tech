const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String, required: true, minlength: 8 },
  username:    { type: String, unique: true, sparse: true },
  college:     { type: String, default: '' },
  branch:      { type: String, default: '' },
  year:        { type: String, default: '' },
  bio:         { type: String, default: '' },
  avatar:      { type: String, default: '' },
  skills:      [String],
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  connectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  if (!this.username) this.username = this.email.split('@')[0] + '_' + Date.now().toString().slice(-4);
  if (!this.avatar) this.avatar = `https://api.dicebear.com/9.x/notionists/svg?seed=${this.name}&backgroundColor=b6e3f4`;
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
