const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL ERROR: JWT_SECRET is missing from environment variables.");
  process.exit(1);
}

const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

connectDB().then(() => {
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5174"].filter(Boolean),
      methods: ["GET", "POST"],
    },
  });

  //  Socket logic
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    //  GLOBAL CHAT
    socket.on("sendMessage", ({ senderId, message }) => {
      io.emit("receiveMessage", {
        senderId,
        message,
        createdAt: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });

  server.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  });
});