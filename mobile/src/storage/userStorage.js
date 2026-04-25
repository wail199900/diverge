import AsyncStorage from "@react-native-async-storage/async-storage";

const USERNAME_KEY = "diverge_username";
const AVATAR_KEY = "diverge_avatar";
const ROOM_CODE_KEY = "diverge_room_code";

export const saveUsernameToStorage = async (username) => {
  try {
    await AsyncStorage.setItem(USERNAME_KEY, username);
  } catch (error) {
    console.log("Failed to save username:", error.message);
  }
};

export const getUsernameFromStorage = async () => {
  try {
    const username = await AsyncStorage.getItem(USERNAME_KEY);
    return username || "";
  } catch (error) {
    console.log("Failed to load username:", error.message);
    return "";
  }
};

export const saveAvatarToStorage = async (avatar) => {
  try {
    await AsyncStorage.setItem(AVATAR_KEY, avatar);
  } catch (error) {
    console.log("Failed to save avatar:", error.message);
  }
};

export const getAvatarFromStorage = async () => {
  try {
    const avatar = await AsyncStorage.getItem(AVATAR_KEY);
    return avatar || "😀";
  } catch (error) {
    console.log("Failed to load avatar:", error.message);
    return "😀";
  }
};

export const clearUserProfileFromStorage = async () => {
  try {
    await AsyncStorage.multiRemove(USERNAME_KEY, AVATAR_KEY);
  } catch (error) {
    console.log("Failed to clear profile:", error.message);
  }
};

export const saveRoomCodeToStorage = async (roomCode) => {
  try {
    await AsyncStorage.setItem(ROOM_CODE_KEY, roomCode);
  } catch (error) {
    console.log("Failed to save room code:", error.message);
  }
};

export const getRoomCodeFromStorage = async () => {
  try {
    const roomCode = await AsyncStorage.getItem(ROOM_CODE_KEY);
    return roomCode || "";
  } catch (error) {
    console.log("Failed to load room code:", error.message);
    return "";
  }
};

export const clearRoomCodeFromStorage = async () => {
  try {
    await AsyncStorage.removeItem(ROOM_CODE_KEY);
  } catch (error) {
    console.log("Failed to clear room code:", error.message);
  }
};
