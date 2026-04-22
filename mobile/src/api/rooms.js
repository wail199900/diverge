import client from "./client";

export const createRoom = async (username, avatar) => {
  const response = await client.post("/api/rooms/create", { username, avatar });
  return response.data;
};

export const joinRoom = async (roomCode, username, avatar) => {
  const response = await client.post("/api/rooms/join", {
    roomCode,
    username,
    avatar,
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

export const updateRoomCategory = async (roomCode, username, category) => {
  const response = await client.patch(`/api/rooms/${roomCode}/category`, {
    username,
    category,
  });
  return response.data;
};
