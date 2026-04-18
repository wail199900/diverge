import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { joinRoom } from "../api/rooms";
import useGameStore from "../store/useGameStore";

export default function JoinRoomScreen({ navigation }) {
  const [username, setUsernameInput] = useState("");
  const [roomCode, setRoomCodeInput] = useState("");
  const [loading, setLoading] = useState(false);

  const setUsername = useGameStore((state) => state.setUsername);
  const setRoom = useGameStore((state) => state.setRoom);
  const setStoredRoomCode = useGameStore((state) => state.setRoomCode);

  const handleJoinRoom = async () => {
    if (!username.trim() || !roomCode.trim()) {
      Alert.alert("Validation", "Please enter username and room code");
      return;
    }

    try {
      setLoading(true);
      const room = await joinRoom(
        roomCode.trim().toUpperCase(),
        username.trim(),
      );

      setUsername(username.trim());
      setRoom(room);
      setStoredRoomCode(room.roomCode);

      navigation.navigate("Lobby");
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to join room",
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

      <Text style={styles.label}>Room code</Text>
      <TextInput
        value={roomCode}
        onChangeText={setRoomCodeInput}
        placeholder="Enter room code"
        autoCapitalize="characters"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleJoinRoom}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Joining..." : "Join Room"}
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
