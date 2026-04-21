import { create } from "zustand";

const useGameStore = create((set) => ({
  username: "",
  roomCode: "",
  room: null,
  session: null,
  results: null,

  setUsername: (username) => set({ username }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setRoom: (room) => set({ room }),
  setSession: (session) => set({ session }),
  setResults: (results) => set({ results }),

  clearGame: () =>
    set({
      username: "",
      roomCode: "",
      room: null,
      session: null,
      results: null,
    }),
}));

export default useGameStore;
