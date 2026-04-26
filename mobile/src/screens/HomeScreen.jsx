import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../theme/colors";
import { getRoom } from "../api/rooms";
import { getActiveSession, getResults } from "../api/sessions";
import useGameStore from "../store/useGameStore";
import {
  getAvatarFromStorage,
  getRoomCodeFromStorage,
  getUsernameFromStorage,
} from "../storage/userStorage";
import LoadingState from "../components/LoadingState";

export default function HomeScreen({ navigation }) {
  const [savedRoomCode, setSavedRoomCode] = useState("");
  const [loadingResume, setLoadingResume] = useState(false);

  const setUsername = useGameStore((state) => state.setUsername);
  const setAvatar = useGameStore((state) => state.setAvatar);
  const setRoomCode = useGameStore((state) => state.setRoomCode);
  const setRoom = useGameStore((state) => state.setRoom);
  const setSession = useGameStore((state) => state.setSession);
  const setResults = useGameStore((state) => state.setResults);

  useEffect(() => {
    const loadSavedRoom = async () => {
      const roomCode = await getRoomCodeFromStorage();
      setSavedRoomCode(roomCode);
    };

    const unsubscribe = navigation.addListener("focus", loadSavedRoom);

    loadSavedRoom();

    return unsubscribe;
  }, [navigation]);

  const handleResumeGame = async () => {
    if (!savedRoomCode) return;

    try {
      setLoadingResume(true);

      const savedUsername = await getUsernameFromStorage();
      const savedAvatar = await getAvatarFromStorage();

      if (!savedUsername) {
        Alert.alert(
          "Missing profile",
          "Please set your profile before resuming.",
        );
        navigation.navigate("Profile");
        return;
      }

      const room = await getRoom(savedRoomCode);

      setUsername(savedUsername);
      setAvatar(savedAvatar);
      setRoomCode(room.roomCode);
      setRoom(room);

      if (room.status === "waiting") {
        navigation.navigate("Lobby");
        return;
      }

      if (room.status === "playing") {
        const session = await getActiveSession(room.roomCode);
        setSession(session);
        navigation.navigate("Question");
        return;
      }

      if (room.status === "finished") {
        try {
          const results = await getResults(room.roomCode);
          setResults(results);
          navigation.navigate("Results");
        } catch {
          navigation.navigate("Lobby");
        }
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Could not resume game",
      );
    } finally {
      setLoadingResume(false);
    }
  };

  if (loadingResume) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Resuming your game..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Diverge</Text>
        <Text style={styles.subtitle}>Discover where answers split.</Text>
      </View>

      <View style={styles.card}>
        {savedRoomCode ? (
          <TouchableOpacity
            style={styles.button}
            onPress={handleResumeGame}
            disabled={loadingResume}
          >
            <Text style={styles.buttonText}>
              {loadingResume ? "Resuming..." : `Resume Room ${savedRoomCode}`}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("CreateRoom")}
        >
          <Text style={styles.buttonText}>Creat Room</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("JoinRoom")}
        >
          <Text style={styles.secondaryButtonText}>Join Room</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("History")}
        >
          <Text style={styles.secondaryButtonText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.secondaryButtonText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("HowToPlay")}
        >
          <Text style={styles.secondaryButtonText}>How to Play</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },

  hero: {
    marginBottom: 28,
  },

  title: {
    fontSize: 40,
    fontWeight: "700",
    textAlign: "center",
    color: colors.text,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: colors.subtext,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
  },

  button: {
    borderRadius: 14,
    backgroundColor: colors.primary,
    marginBottom: 14,
    paddingVertical: 16,
  },
  buttonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 12,
  },

  secondaryButtonText: {
    color: colors.primary,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
