import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createRoom } from "../api/rooms";
import useGameStore from "../store/useGameStore";
import colors from "../theme/colors";

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
      <View style={styles.card}>
        <Text style={styles.title}>Create a room</Text>
        <Text style={styles.subtitle}>
          Choose a name and start a new round.
        </Text>
        <Text style={styles.label}>Your name</Text>
        <TextInput
          value={username}
          onChangeText={setUsernameInput}
          placeholder="Enter username"
          placeholderTextColor={colors.subtext}
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

  subtitle: {
    fontSize: 15,
    color: colors.subtext,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },

  label: {
    fontSize: 15,
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
