const express = require("express");
const Room = require("../models/Room");
const generateRoomCode = require("../utils/generateRoomCode");
const GameSession = require("../models/GameSession");

const router = express.Router();

// Create room route

router.post("/create", async (req, res) => {
  try {
    const { username, avatar } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Username is required" });
    }

    let roomCode;
    let existingRoom;

    do {
      roomCode = generateRoomCode();
      existingRoom = await Room.findOne({ roomCode });
    } while (existingRoom);

    const room = await Room.create({
      roomCode,
      selectedCategory: "all",
      players: [
        {
          username: username.trim(),
          avatar: avatar || "😀",
        },
      ],
    });
    return res.status(201).json(room);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Join room route

router.post("/join", async (req, res) => {
  try {
    const { roomCode, username, avatar } = req.body;

    if (!roomCode || !username || !username.trim()) {
      return res.status(400).json({
        message: "Room code and username are required",
      });
    }

    const room = await Room.findOne({
      roomCode: roomCode.trim().toUpperCase(),
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const usernameExists = room.players.some(
      (player) =>
        player.username.toLowerCase() === username.trim().toLowerCase(),
    );

    if (usernameExists) {
      return res
        .status(400)
        .json({ message: "Username already taken in this room" });
    }

    room.players.push({
      username: username.trim(),
      avatar: avatar || "😀",
    });

    await room.save();

    return res.status(200).json(room);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get room by code route
router.get("/:roomCode", async (req, res) => {
  try {
    const { roomCode } = req.params;
    const room = await Room.findOne({
      roomCode: roomCode.trim().toUpperCase(),
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    return res.status(200).json(room);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Reset room route
router.post("/:roomCode/reset", async (req, res) => {
  try {
    const roomCode = req.params.roomCode.trim().toUpperCase();

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.status = "waiting";
    room.players = room.players.map((player) => ({
      username: player.username,
      socketId: player.socketId || null,
      ready: false,
    }));

    await room.save();

    await GameSession.deleteMany({ roomCode });

    return res.status(200).json({
      message: "Room reset successfully",
      room,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Update room category route
router.patch("/:roomCode/category", async (req, res) => {
  try {
    const roomCode = req.params.roomCode.trim().toUpperCase();
    const { username, category } = req.body;

    if (!username || !category) {
      return res.status(400).json({
        message: "Username and category are required",
      });
    }

    const allowedCategories = [
      "all",
      "fun",
      "deep",
      "dating",
      "friends",
      "general",
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid category",
      });
    }

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const hostUsername = room.players?.[0]?.username;

    if (
      !hostUsername ||
      hostUsername.toLowerCase() !== username.trim().toLowerCase()
    ) {
      return res.status(403).json({
        message: "Only the host can change the category",
      });
    }

    room.selectedCategory = category;
    await room.save();

    return res.status(200).json({
      message: "Category updated successfully",
      room,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
