import client from "./client";

export const createRoom = async (username) => {
  const response = await client.post("/api/rooms/create", { username });
  return response.data;
};

export const joinRoom = async (roomCode, username) => {
  const response = await client.post("/api/rooms/join", {
    roomCode,
    username,
  });
  return response.data;
};

export const getRoom = async (roomCode) => {
  const response = await client.get(`/api/rooms/${roomCode}`);
  return response.data;
};

export const resetRoom = async (roomCode) => {
  const response = await client.post(`/api/rooms/${roomCode}/reset`);
  return response.data;
};
