import { create } from "zustand";

const useGameStore = create((set) => ({
  username: "",
  avatar: "😀",
  roomCode: "",
  room: null,
  session: null,
  results: null,

  setUsername: (username) => set({ username }),
  setAvatar: (avatar) => set({ avatar }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setRoom: (room) => set({ room }),
  setSession: (session) => set({ session }),
  setResults: (results) => set({ results }),

  clearGame: () =>
    set({
      username: "",
      avatar: "😀",
      roomCode: "",
      room: null,
      session: null,
      results: null,
    }),
}));

export default useGameStore;
