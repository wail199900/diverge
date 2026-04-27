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
  getAvatarFromStorage,
  getUsernameFromStorage,
  saveAvatarToStorage,
  saveUsernameToStorage,
  saveRoomCodeToStorage,
} from "../storage/userStorage";
import useGameStore from "../store/useGameStore";
import colors from "../theme/colors";
import * as Clipboard from "expo-clipboard";

export default function JoinRoomScreen({ navigation }) {
  const [username, setUsernameInput] = useState("");
  const [avatar, setAvatar] = useState("😀");
  const [roomCode, setRoomCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clipboardCode, setClipboardCode] = useState("");

  const setUsername = useGameStore((state) => state.setUsername);
  const setAvatarInStore = useGameStore((state) => state.setAvatar);
  const setRoom = useGameStore((state) => state.setRoom);
  const setStoredRoomCode = useGameStore((state) => state.setRoomCode);

  const avatarOptions = ["😀", "😎", "🔥", "🧠", "🎯", "🚀", "👾", "🐼"];

  useEffect(() => {
    const loadSavedUsername = async () => {
      const savedUsername = await getUsernameFromStorage();
      const savedAvatar = await getAvatarFromStorage();

      if (savedUsername) {
        setUsernameInput(savedUsername);
      }
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    };

    loadSavedUsername();

    const checkClipboard = async () => {
      const text = await Clipboard.getStringAsync();
      const cleaned = text.trim().toUpperCase();

      if (/^[A-Z0-9]{6}$/.test(cleaned)) {
        setClipboardCode(cleaned);
      }
    };

    checkClipboard();
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
        avatar,
      );

      await saveUsernameToStorage(trimmedUsername);
      await saveAvatarToStorage(avatar);
      await saveRoomCodeToStorage(room.roomCode);

      setUsername(trimmedUsername);
      setAvatarInStore(avatar);
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

        <Text style={styles.label}>Choose an avatar</Text>
        <View style={styles.avatarRow}>
          {avatarOptions.map((item) => {
            const isSelected = avatar === item;

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.avatarChip,
                  isSelected && styles.avatarChipSelected,
                ]}
                onPress={() => setAvatar(item)}
              >
                <Text style={styles.avatarText}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Room code</Text>
        {clipboardCode ? (
          <TouchableOpacity
            style={styles.clipboardBox}
            onPress={() => setRoomCodeInput(clipboardCode)}
          >
            <Text style={styles.clipboardText}>
              Use copied room code: {clipboardCode}
            </Text>
          </TouchableOpacity>
        ) : null}

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

  avatarRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  avatarChip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: colors.surface,
  },

  avatarChipSelected: {
    borderColor: colors.primary,
    backgroundColor: "#EEF2FF",
  },

  avatarText: {
    fontSize: 24,
  },

  clipboardBox: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "#EEF2FF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },

  clipboardText: {
    color: colors.primary,
    fontWeight: "600",
    textAlign: "center",
  },
});
