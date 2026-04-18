const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    category: {
      type: String,
      enum: ["fun", "deep", "dating", "friends", "general"],
      default: "general",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Question", questionSchema);
