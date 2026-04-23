const mongoose = require('mongoose');

function stripQuotes(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/^['"]|['"]$/g, '');
}

const connectDB = async () => {
  const uri = stripQuotes(process.env.MONGO_URI || '');
  if (!uri) {
    console.error('❌ FATAL ERROR: MONGO_URI is missing from environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ FATAL ERROR: MongoDB connection failed (${err.code || err.message}).`);
    process.exit(1);
  }
};

module.exports = connectDB;
