const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');

mongoose.connect('mongodb+srv://TRIAL:ParakramAHOME17@devtinder.ta4cwsg.mongodb.net/?appName=devtinder').then(async () => {
  const posts = await Post.find({});
  console.log('Total posts in DB:', posts.length);
  const authors = {};
  for (const post of posts) {
    authors[post.author] = (authors[post.author] || 0) + 1;
  }
  console.log('Posts by author:', authors);

  const users = await User.find({});
  console.log('Total users:', users.length);
  for(const u of users) {
     console.log(`User: ${u.name} | ID: ${u._id}`);
  }
  process.exit(0);
}).catch(err => { console.error("Mongo Error:", err.message); process.exit(1); });
