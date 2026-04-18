const express = require("express");
const cors = require("cors");
const roomRoutes = require("./routes/roomRoutes");
const questionRoutes = require("./routes/questionRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Diverge API is running" });
});

app.use("/api/rooms", roomRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/sessions", sessionRoutes);

module.exports = app;
