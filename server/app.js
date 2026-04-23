const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();


const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:5173',
  'https://web-tech-1-56l0.onrender.com',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl/postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));


const path = require('path');

app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/users', require('./routes/userRoutes'));


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});


// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
} else {
  app.use((err, req, res, next) => {
    console.error('🔥 Error:', err.message);

    if (err.message.includes('CORS')) {
      return res.status(403).json({
        message: err.message,
      });
    }

    res.status(500).json({
      message: 'Internal Server Error',
    });
  });
}

module.exports = app;