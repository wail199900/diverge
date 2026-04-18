import { useCallback, useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, StyleSheet, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getRoom } from "../api/rooms";
import { getActiveSession, startSession } from "../api/sessions";
import useGameStore from "../store/useGameStore";

export default function LobbyScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const hasNavigatedRef = useRef(false);

  const username = useGameStore((state) => state.username);
  const roomCode = useGameStore((state) => state.roomCode);
  const room = useGameStore((state) => state.room);
  const setRoom = useGameStore((state) => state.setRoom);
  const setSession = useGameStore((state) => state.setSession);

  const refreshRoom = useCallback(async () => {
    try {
      const updatedRoom = await getRoom(roomCode);
      setRoom(updatedRoom);
    } catch (error) {
      console.log(
        "Failed to refresh room:",
        error?.response?.data || error.message,
      );
    }
  }, [roomCode, setRoom]);

  const checkForStartedSession = useCallback(async () => {
    try {
      const sessionData = await getActiveSession(roomCode);

      if (sessionData && !hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        setSession(sessionData);
        navigation.replace("Question");
      }
    } catch (error) {
      // 404 here is normal if session has not started yet
      if (error?.response?.status !== 404) {
        console.log(
          "Failed to check active session:",
          error?.response?.data || error.message,
        );
      }
    }
  }, [roomCode, setSession, navigation]);

  const handleStartGame = async () => {
    try {
      setLoading(true);
      const sessionData = await startSession(roomCode);
      setSession(sessionData);
      hasNavigatedRef.current = true;
      navigation.replace("Question");
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to start game",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRoom();
    checkForStartedSession();

    const interval = setInterval(() => {
      refreshRoom();
      checkForStartedSession();
    }, 2000);

    return () => clearInterval(interval);
  }, [refreshRoom, checkForStartedSession]);

  const isHost = room?.players?.[0]?.username === username;
  const canStart = room?.players?.length === 2;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Lobby</Text>
      <Text style={styles.roomCode}>Room Code: {roomCode}</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Players</Text>
        {room?.players?.map((player, index) => (
          <Text key={`${player.username}-${index}`} style={styles.player}>
            • {player.username}
          </Text>
        ))}
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={refreshRoom}>
        <Text style={styles.secondaryButtonText}>Refresh Lobby</Text>
      </TouchableOpacity>

      {isHost && (
        <TouchableOpacity
          style={[styles.button, !canStart && styles.disabledButton]}
          onPress={handleStartGame}
          disabled={!canStart || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Starting..." : "Start Game"}
          </Text>
        </TouchableOpacity>
      )}

      {!isHost && (
        <Text style={styles.infoText}>
          Waiting for the host to start the game...
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  roomCode: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  player: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#222",
    padding: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    textAlign: "center",
    fontWeight: "600",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  infoText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 16,
  },
});
