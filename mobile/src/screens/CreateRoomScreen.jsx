import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createRoom } from "../api/rooms";
import useGameStore from "../store/useGameStore";

export default function CreateRoomScreen({ navigation }) {
  const [username, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(false);

  const setUsername = useGameStore((state) => state.setUsername);
  const setRoom = useGameStore((state) => state.setRoom);
  const setRoomCode = useGameStore((state) => state.setRoomCode);

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      Alert.alert("Validation", "Please enter a username");
      return;
    }

    try {
      setLoading(true);
      const room = await createRoom(username.trim());

      setUsername(username.trim());
      setRoom(room);
      setRoomCode(room.roomCode);

      navigation.navigate("Lobby");
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to create room",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Your name</Text>
      <TextInput
        value={username}
        onChangeText={setUsernameInput}
        placeholder="Enter username"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateRoom}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating..." : "Create Room"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
