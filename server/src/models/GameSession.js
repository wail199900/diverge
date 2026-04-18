const mongoose = require("mongoose");
const answearSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    answer: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },
  },
  { _id: false },
);

const playerProgressSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    finished: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const gameSessionSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    players: {
      type: [playerProgressSchema],
      default: [],
    },
    answers: {
      type: [answearSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("GameSession", gameSessionSchema);
