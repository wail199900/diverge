import client from "./client";

export const startSession = async (roomCode) => {
  const response = await client.post("/api/sessions/start", { roomCode });
  return response.data;
};

export const getActiveSession = async (roomCode) => {
  const response = await client.get(`/api/sessions/${roomCode}`);
  return response.data;
};

export const submitAnswer = async ({
  roomCode,
  username,
  questionId,
  answer,
}) => {
  const response = await client.post("/api/sessions/answer", {
    roomCode,
    username,
    questionId,
    answer,
  });
  return response.data;
};

export const finishSession = async (roomCode, username) => {
  const response = await client.post("/api/sessions/finish", {
    roomCode,
    username,
  });
  return response.data;
};

export const getSessionProgress = async (roomCode) => {
  const response = await client.get(`/api/sessions/${roomCode}/progress`);
  return response.data;
};

export const getResults = async (roomCode) => {
  const response = await client.get(`/api/sessions/${roomCode}/results`);
  return response.data;
};
