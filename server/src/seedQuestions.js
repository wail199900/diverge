const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Question = require("./models/Question");
const questions = require("./data/questions");

dotenv.config();

async function seedQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    await Question.deleteMany({});
    await Question.insertMany(questions);

    console.log("Questions seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
}

seedQuestions();
