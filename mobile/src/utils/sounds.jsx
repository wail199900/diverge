import { Audio } from "expo-av";

let swipeSound;
let successSound;

export const loadSounds = async () => {
  swipeSound = new Audio.Sound();
  successSound = new Audio.Sound();

  await swipeSound.loadAsync(require("../assets/sounds/swipe.m4a"));
  await successSound.loadAsync(require("../assets/sounds/success.m4a"));
};

export const playSwipeSound = async () => {
  try {
    if (swipeSound) {
      await swipeSound.replayAsync();
    }
  } catch {}
};

export const playSuccessSound = async () => {
  try {
    if (successSound) {
      await successSound.replayAsync();
    }
  } catch {}
};
