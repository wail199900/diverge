import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { joinRoom } from "../api/rooms";
import {
  getUsernameFromStorage,
  saveUsernameToStorage,
} from "../storage/userStorage";
import useGameStore from "../store/useGameStore";
import colors from "../theme/colors";

export default function JoinRoomScreen({ navigation }) {
  const [username, setUsernameInput] = useState("");
  const [roomCode, setRoomCodeInput] = useState("");
  const [loading, setLoading] = useState(false);

  const setUsername = useGameStore((state) => state.setUsername);
  const setRoom = useGameStore((state) => state.setRoom);
  const setStoredRoomCode = useGameStore((state) => state.setRoomCode);

  useEffect(() => {
    const loadSavedUsername = async () => {
      const savedUsername = await getUsernameFromStorage();

      if (savedUsername) {
        setUsernameInput(savedUsername);
      }
    };

    loadSavedUsername();
  }, []);

  const handleJoinRoom = async () => {
    if (!username.trim() || !roomCode.trim()) {
      Alert.alert("Validation", "Please enter username and room code");
      return;
    }

    try {
      setLoading(true);
      const trimmedUsername = username.trim();
      const room = await joinRoom(
        roomCode.trim().toUpperCase(),
        trimmedUsername,
      );

      await saveUsernameToStorage(trimmedUsername);

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
      <View style={styles.card}>
        <Text style={styles.title}>Join a room</Text>
        <Text style={styles.subtitle}>Enter your name and the room code.</Text>

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
          placeholderTextColor={colors.subtext}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: colors.subtext,
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.text,
    fontWeight: "500",
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    color: colors.text,
  },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  buttonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});
