import { create } from "zustand";

const useGameStore = create((set) => ({
  username: "",
  roomCode: "",
  room: null,
  session: null,
  results: null,
  selectedCategory: "all",

  setUsername: (username) => set({ username }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setRoom: (room) => set({ room }),
  setSession: (session) => set({ session }),
  setResults: (results) => set({ results }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  clearGame: () =>
    set({
      username: "",
      roomCode: "",
      room: null,
      session: null,
      results: null,
      selectedCategory: "all",
    }),
}));

export default useGameStore;
