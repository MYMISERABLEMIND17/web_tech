const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const state = {
  users: [],
  posts: [],
};

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return crypto.randomUUID();
}

function publicUser(user) {
  if (!user) return null;
  // Match fields the client expects.
  // Keep `_id` stable and omit `password`.
  // eslint-disable-next-line no-unused-vars
  const { password, ...rest } = user;
  return { ...rest };
}

function ensureDefaultsForUser(user) {
  const username =
    user.username ||
    `${String(user.email || 'user').split('@')[0]}_${Date.now().toString().slice(-4)}`;
  const avatar =
    user.avatar ||
    `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(
      user.name || 'User',
    )}&backgroundColor=b6e3f4`;

  return {
    college: '',
    branch: '',
    year: '',
    bio: '',
    skills: [],
    connections: [],
    connectionRequests: [],
    sentRequests: [],
    followers: [],
    following: [],
    ...user,
    username,
    avatar,
  };
}

async function createUser({ name, email, password, college, branch, year }) {
  const user = ensureDefaultsForUser({
    _id: makeId(),
    name,
    email: String(email || '').toLowerCase(),
    password: await bcrypt.hash(password, 10),
    college: college || '',
    branch: branch || '',
    year: year || '',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  state.users.push(user);
  return user;
}

function findUserByEmail(email) {
  return state.users.find((u) => u.email === String(email || '').toLowerCase()) || null;
}

function findUserById(id) {
  return state.users.find((u) => u._id === id) || null;
}

function listUsers() {
  return state.users.map(publicUser);
}

async function matchPassword(user, entered) {
  if (!user) return false;
  return bcrypt.compare(String(entered || ''), user.password);
}

function updateUserById(id, updates) {
  const user = findUserById(id);
  if (!user) return null;
  Object.assign(user, updates, { updatedAt: nowIso() });
  return user;
}

function toggleConnection(userId, targetId) {
  const user = findUserById(userId);
  const target = findUserById(targetId);
  if (!user || !target) return false;

  const sentIdx = user.sentRequests.findIndex((id) => id === targetId);
  const reqIdx = target.connectionRequests.findIndex((id) => id === userId);

  if (sentIdx >= 0) {
    // Withdraw request
    user.sentRequests.splice(sentIdx, 1);
    if (reqIdx >= 0) target.connectionRequests.splice(reqIdx, 1);
  } else {
    // Send request
    user.sentRequests.push(targetId);
    if (reqIdx < 0) target.connectionRequests.push(userId);
  }
  
  user.updatedAt = nowIso();
  target.updatedAt = nowIso();
  return { 
    userSentRequests: user.sentRequests, 
    targetConnectionRequests: target.connectionRequests 
  };
}

function acceptConnection(userId, targetId) {
  const user = findUserById(userId);
  const target = findUserById(targetId);
  if (!user || !target) return false;

  // Remove from requests
  user.connectionRequests = user.connectionRequests.filter(id => id !== targetId);
  target.sentRequests = target.sentRequests.filter(id => id !== userId);

  // Add to connections
  if (!user.connections.includes(targetId)) user.connections.push(targetId);
  if (!target.connections.includes(userId)) target.connections.push(userId);

  user.updatedAt = nowIso();
  target.updatedAt = nowIso();
  return { 
    userConnections: user.connections, 
    userConnectionRequests: user.connectionRequests 
  };
}

function rejectConnection(userId, targetId) {
  const user = findUserById(userId);
  const target = findUserById(targetId);
  if (!user || !target) return false;

  user.connectionRequests = user.connectionRequests.filter(id => id !== targetId);
  target.sentRequests = target.sentRequests.filter(id => id !== userId);

  user.updatedAt = nowIso();
  target.updatedAt = nowIso();
  return { userConnectionRequests: user.connectionRequests };
}

function getMyRequests(userId) {
  const user = findUserById(userId);
  if (!user) return [];
  
  return user.connectionRequests
    .map(id => findUserById(id))
    .filter(Boolean)
    .map(u => ({ _id: u._id, name: u.name, avatar: u.avatar }));
}

function listPosts() {
  return [...state.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function createPost({ authorId, content, image }) {
  const post = {
    _id: makeId(),
    author: authorId,
    content,
    image: image || null,
    likes: [],
    comments: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  state.posts.push(post);
  return post;
}

function findPostById(id) {
  return state.posts.find((p) => p._id === id) || null;
}

function deletePostById(id) {
  const idx = state.posts.findIndex((p) => p._id === id);
  if (idx === -1) return false;
  state.posts.splice(idx, 1);
  return true;
}

function toggleLike(post, userId) {
  const idx = post.likes.findIndex((id) => id === userId);
  if (idx >= 0) post.likes.splice(idx, 1);
  else post.likes.push(userId);
  post.updatedAt = nowIso();
  return post.likes;
}

function populatePostAuthor(post) {
  const author = findUserById(post.author);
  const authorPublic = author
    ? {
        _id: author._id,
        name: author.name,
        username: author.username,
        college: author.college,
        avatar: author.avatar,
      }
    : null;

  const comments = Array.isArray(post.comments)
    ? post.comments.map((c) => {
        const u = findUserById(c.user);
        return {
          ...c,
          user: u
            ? { _id: u._id, name: u.name, username: u.username, avatar: u.avatar }
            : null,
        };
      })
    : [];

  return { ...post, author: authorPublic, comments };
}

function postsByAuthor(authorId) {
  return listPosts().filter((p) => p.author === authorId).map(populatePostAuthor);
}

module.exports = {
  state,
  publicUser,
  createUser,
  findUserByEmail,
  findUserById,
  matchPassword,
  updateUserById,
  listUsers,
  toggleConnection,
  acceptConnection,
  rejectConnection,
  getMyRequests,
  listPosts,
  createPost,
  findPostById,
  deletePostById,
  toggleLike,
  populatePostAuthor,
  postsByAuthor,
};

