import AsyncStorage from "@react-native-async-storage/async-storage";

const USERNAME_KEY = "diverge_username";

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

export const clearUsernameFromStorage = async () => {
  try {
    await AsyncStorage.removeItem(USERNAME_KEY);
  } catch (error) {
    console.log("Failed to clear username:", error.message);
  }
};
