const express = require("express");
const Question = require("../models/Question");

const router = express.Router();

// Get 10 random active questions

router.get("/random", async (req, res) => {
  try {
    const questions = await Question.aggregate([
      { $match: { active: true } },
      { $sample: { size: 10 } },
    ]);
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
