const express = require("express");
const Room = require("../models/Room");
const Question = require("../models/Question");
const GameSession = require("../models/GameSession");

const router = express.Router();

// start game endpoint

router.post("/start", async (req, res) => {
  try {
    const { roomCode } = req.body;

    if (!roomCode) {
      return res.status(400).json({ message: "Room code is required" });
    }
    const normalizedRoomCode = roomCode.trim().toUpperCase();

    const room = await Room.findOne({ roomCode: normalizedRoomCode });

    if (!room) {
      return res.status(400).json({ message: "Room not found" });
    }
    const category = room.selectedCategory || "all";

    if (room.players.length !== 2) {
      return res
        .status(400)
        .json({ message: "A game requires exactly 2 players" });
    }

    const existingActiveSession = await GameSession.findOne({
      roomCode: normalizedRoomCode,
      status: "active",
    });

    if (existingActiveSession) {
      return res
        .status(400)
        .json({ message: "An active session already exists for this room" });
    }

    const matchStage = { active: true };
    if (category && category !== "all") {
      matchStage.category = category;
    }

    const questions = await Question.aggregate([
      { $match: matchStage },
      { $sample: { size: 10 } },
    ]);

    if (questions.length < 10) {
      return res
        .status(400)
        .json({ message: "Not enough active questions available" });
    }

    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + 60 * 1000);

    const session = await GameSession.create({
      roomCode: normalizedRoomCode,
      category,
      questions: questions.map((q) => q._id),
      players: room.players.map((player) => ({
        username: player.username,
        finished: false,
      })),
      answers: [],
      status: "active",
      startedAt,
      endsAt,
    });

    room.status = "playing";
    await room.save();

    return res.status(201).json({
      message: "Game session started",
      sessionId: session._id,
      roomCode: session.roomCode,
      questions,
      players: session.players,
      status: session.status,
      startedAt: session.startedAt,
      endsAt: session.endsAt,
      category: category || "all",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// get active session for a room

router.get("/:roomCode", async (req, res) => {
  try {
    const roomCode = req.params.roomCode.trim().toUpperCase();

    const session = await GameSession.findOne({
      roomCode,
      status: "active",
    }).populate("questions");

    if (!session) {
      return res.status(404).json({ message: "Active session not found" });
    }

    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// submit one answer

router.post("/answer", async (req, res) => {
  try {
    const { roomCode, username, questionId, answer } = req.body;

    if (!roomCode || !username || !questionId || !answer) {
      return res.status(400).json({
        message: "Room code, username, questionId, and answer are required",
      });
    }

    if (!["yes", "no"].includes(answer)) {
      return res.status(400).json({ message: 'Answer must be "yes" or "no"' });
    }

    const normalizedRoomCode = roomCode.trim().toUpperCase();

    const session = await GameSession.findOne({
      roomCode: normalizedRoomCode,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({ message: "Active session not found" });
    }

    const playerExists = session.players.some(
      (player) =>
        player.username.toLowerCase() === username.trim().toLowerCase(),
    );

    if (!playerExists) {
      return res
        .status(400)
        .json({ message: "Player is not part of this session" });
    }

    if (session.status !== "active") {
      return res.status(400).json({ message: "Session is no longer active" });
    }

    const playerProgress = session.players.find(
      (player) =>
        player.username.toLowerCase() === username.trim().toLowerCase(),
    );

    if (playerProgress.finished) {
      return res
        .status(400)
        .json({ message: "Player has already finished answering" });
    }

    const questionInSession = session.questions.some(
      (id) => id.toString() === questionId,
    );

    if (!questionInSession) {
      return res
        .status(400)
        .json({ message: "Question does not belong to this session" });
    }

    const duplicateAnswer = session.answers.some(
      (item) =>
        item.username.toLowerCase() === username.trim().toLowerCase() &&
        item.questionId.toString() === questionId,
    );

    if (duplicateAnswer) {
      return res
        .status(400)
        .json({ message: "Answer already submitted for this question" });
    }

    session.answers.push({
      username: username.trim(),
      questionId,
      answer,
    });

    await session.save();

    return res.status(201).json({
      message: "Answer submitted successfully",
      answersCount: session.answers.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// mark player finished

router.post("/finish", async (req, res) => {
  try {
    const { roomCode, username } = req.body;

    if (!roomCode || !username) {
      return res
        .status(400)
        .json({ message: "Room code and username are required" });
    }

    const normalizedRoomCode = roomCode.trim().toUpperCase();
    const normalizedUsername = username.trim();

    const session = await GameSession.findOne({
      roomCode: normalizedRoomCode,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({ message: "Active session not found" });
    }

    const player = session.players.find(
      (p) => p.username.toLowerCase() === normalizedUsername.toLowerCase(),
    );

    if (!player) {
      return res
        .status(404)
        .json({ message: "Player is not part of this session" });
    }

    if (player.finished) {
      return res
        .status(400)
        .json({ message: "Player already marked as finished" });
    }

    const playerAnswersCount = session.answers.filter(
      (a) => a.username.toLowerCase() === normalizedUsername.toLowerCase(),
    ).length;

    /*if (playerAnswersCount !== session.questions.length) {
      return res.status(400).json({
        message: "Player cannot finish before answering all questions",
        answered: playerAnswersCount,
        required: session.questions.length,
      });
    }*/

    player.finished = true;

    const allFinished = session.players.every((p) => p.finished);

    if (allFinished) {
      session.status = "completed";

      const room = await Room.findOne({ roomCode: normalizedRoomCode });
      if (room) {
        room.status = "finished";
        await room.save();
      }
    }

    await session.save();

    return res.status(200).json({
      message: "Player marked as finished",
      allFinished,
      sessionStatus: session.status,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// compute results and mismatches

router.get("/:roomCode/results", async (req, res) => {
  try {
    const roomCode = req.params.roomCode.trim().toUpperCase();

    const session = await GameSession.findOne({
      roomCode,
      status: "completed",
    }).populate("questions");

    if (!session) {
      return res.status(404).json({ message: "Completed session not found" });
    }

    if (session.players.length !== 2) {
      return res
        .status(400)
        .json({ message: "Results require exactly 2 players" });
    }

    const [playerOne, playerTwo] = session.players;

    let matchesCount = 0;

    const mismatches = session.questions.reduce((acc, question) => {
      const firstAnswer = session.answers.find(
        (a) =>
          a.username.toLowerCase() === playerOne.username.toLowerCase() &&
          a.questionId.toString() === question._id.toString(),
      );

      const secondAnswer = session.answers.find(
        (a) =>
          a.username.toLowerCase() === playerTwo.username.toLowerCase() &&
          a.questionId.toString() === question._id.toString(),
      );

      if (firstAnswer && secondAnswer) {
        if (firstAnswer.answer !== secondAnswer.answer) {
          acc.push({
            questionId: question._id,
            questionText: question.text,
            answers: [
              {
                username: playerOne.username,
                answer: firstAnswer.answer,
              },
              {
                username: playerTwo.username,
                answer: secondAnswer.answer,
              },
            ],
          });
        } else {
          matchesCount += 1;
        }
      }

      return acc;
    }, []);

    return res.status(200).json({
      roomCode,
      totalQuestions: session.questions.length,
      matchesCount,
      mismatchesCount: mismatches.length,
      mismatches,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// session progress endpoint

router.get("/:roomCode/progress", async (req, res) => {
  try {
    const roomCode = req.params.roomCode.trim().toUpperCase();

    const session = await GameSession.findOne({ roomCode }).populate(
      "questions",
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const players = session.players.map((player) => {
      const answersCount = session.answers.filter(
        (answer) =>
          answer.username.toLowerCase() === player.username.toLowerCase(),
      ).length;
      return {
        username: player.username,
        finished: player.finished,
        answersCount,
        totalQuestions: session.questions.length,
      };
    });

    return res.status(200).json({
      roomCode: session.roomCode,
      status: session.status,
      players,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// get completed session history by username
router.get("/history/:username", async (req, res) => {
  try {
    const username = req.params.username.trim().toLowerCase();

    const sessions = await GameSession.find({
      status: "completed",
      "players.username": { $regex: new RegExp(`^${username}$`, "i") },
    })
      .populate("questions")
      .sort({ updatedAt: -1 });

    const history = sessions.map((session) => {
      if (session.players.length !== 2) {
        return {
          sessionId: session._id,
          roomCode: session.roomCode,
          category: session.category || "all",
          completedAt: session.updatedAt,
          totalQuestions: session.questions.length,
          matchesCount: 0,
          mismatchesCount: 0,
        };
      }

      const [playerOne, playerTwo] = session.players;

      let matchesCount = 0;
      let mismatchesCount = 0;

      session.questions.forEach((question) => {
        const firstAnswer = session.answers.find(
          (a) =>
            a.username.toLowerCase() === playerOne.username.toLowerCase() &&
            a.questionId.toString() === question._id.toString(),
        );

        const secondAnswer = session.answers.find(
          (a) =>
            a.username.toLowerCase() === playerTwo.username.toLowerCase() &&
            a.questionId.toString() === question._id.toString(),
        );

        if (firstAnswer && secondAnswer) {
          if (firstAnswer.answer === secondAnswer.answer) {
            matchesCount += 1;
          } else {
            mismatchesCount += 1;
          }
        }
      });

      return {
        sessionId: session._id,
        roomCode: session.roomCode,
        category: session.category || "all",
        completedAt: session.updatedAt,
        totalQuestions: session.questions.length,
        matchesCount,
        mismatchesCount,
      };
    });

    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// get completed session details by session id
router.get("/details/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await GameSession.findById(sessionId).populate("questions");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.status !== "completed") {
      return res.status(400).json({ message: "Session is not completed yet" });
    }

    if (session.players.length !== 2) {
      return res
        .status(400)
        .json({ message: "Session requires exactly 2 players" });
    }

    const [playerOne, playerTwo] = session.players;
    let matchesCount = 0;

    const mismatches = session.questions.reduce((acc, question) => {
      const firstAnswer = session.answers.find(
        (a) =>
          a.username.toLowerCase() === playerOne.username.toLowerCase() &&
          a.questionId.toString() === question._id.toString(),
      );

      const secondAnswer = session.answers.find(
        (a) =>
          a.username.toLowerCase() === playerTwo.username.toLowerCase() &&
          a.questionId.toString() === question._id.toString(),
      );

      if (firstAnswer && secondAnswer) {
        if (firstAnswer.answer !== secondAnswer.answer) {
          acc.push({
            questionId: question._id,
            questionText: question.text,
            answers: [
              {
                username: playerOne.username,
                answer: firstAnswer.answer,
              },
              {
                username: playerTwo.username,
                answer: secondAnswer.answer,
              },
            ],
          });
        } else {
          matchesCount += 1;
        }
      }

      return acc;
    }, []);

    return res.status(200).json({
      sessionId: session._id,
      roomCode: session.roomCode,
      category: session.category || "all",
      completedAt: session.updatedAt,
      totalQuestions: session.questions.length,
      matchesCount,
      mismatchesCount: mismatches.length,
      mismatches,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
