const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    socketId: {
      type: String,
      default: null,
    },
    ready: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["waiting", "playing", "finished"],
      default: "waiting",
    },
    players: {
      type: [playerSchema],
      default: [],
      validate: {
        validator: function (players) {
          return players.length <= 2;
        },
        message: "A room can have at most 2 players",
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Room", roomSchema);
