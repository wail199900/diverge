const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", ({ roomCode, username }) => {
    if (!roomCode || !username) return;

    const normalizedRoomCode = roomCode.trim().toUpperCase();

    socket.join(normalizedRoomCode);

    console.log(`${username} joined socket room ${normalizedRoomCode}`);
  });

  socket.on("leave_room", ({ roomCode, username }) => {
    if (!roomCode || !username) return;

    const normalizedRoomCode = roomCode.trim().toUpperCase();

    socket.leave(normalizedRoomCode);

    console.log(`${username} left socket room ${normalizedRoomCode}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });
