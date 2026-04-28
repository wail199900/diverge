import { useEffect, useState, useCallback, useRef } from "react";
import { Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getResults, getSessionProgress } from "../api/sessions";
import useGameStore from "../store/useGameStore";
import colors from "../theme/colors";
import ErrorState from "../components/ErrorState";
import socket from "../api/socket";

export default function WaitingScreen({ navigation }) {
  const [progress, setProgress] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const hasNavigatedRef = useRef(false);

  const roomCode = useGameStore((state) => state.roomCode);
  const username = useGameStore((state) => state.username);
  const setResults = useGameStore((state) => state.setResults);

  const loadInitialProgress = useCallback(async () => {
    try {
      setErrorMessage("");

      const progressData = await getSessionProgress(roomCode);
      setProgress(progressData);

      if (progressData.status === "completed" && !hasNavigatedRef.current) {
        hasNavigatedRef.current = true;

        const results = await getResults(roomCode);
        setResults(results);
        navigation.replace("Results");
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to fetch session progress",
      );
    }
  }, [roomCode, setResults, navigation]);

  useEffect(() => {
    if (!roomCode || !username) return;

    socket.emit("join_room", { roomCode, username });

    const handleSessionProgress = (progressData) => {
      setProgress(progressData);
    };

    const handleGameFinished = (resultsData) => {
      if (hasNavigatedRef.current) return;

      hasNavigatedRef.current = true;
      setResults(resultsData);
      navigation.replace("Results");
    };

    socket.on("session_progress", handleSessionProgress);
    socket.on("game_finished", handleGameFinished);

    loadInitialProgress();

    return () => {
      socket.off("session_progress", handleSessionProgress);
      socket.off("game_finished", handleGameFinished);
    };
  }, [roomCode, username, setResults, navigation, loadInitialProgress]);

  const players = progress?.players || [];

  const currentPlayer = players.find(
    (player) => player.username.toLowerCase() === username.toLowerCase(),
  );

  const otherPlayers = players.filter(
    (player) => player.username.toLowerCase() !== username.toLowerCase(),
  );

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message={errorMessage} onRetry={loadInitialProgress} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" />

      <Text style={styles.title}>Waiting for the other player...</Text>

      <Text style={styles.subtitle}>Results will appear automatically.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Progress</Text>

        {currentPlayer && (
          <View style={styles.playerRow}>
            <View>
              <Text style={styles.playerName}>
                {currentPlayer.username} (You)
              </Text>

              <Text style={styles.playerMeta}>
                {currentPlayer.answersCount} / {currentPlayer.totalQuestions}{" "}
                answered
              </Text>
            </View>

            <Text style={styles.status}>
              {currentPlayer.finished ? "✅" : "⏳"}
            </Text>
          </View>
        )}

        {otherPlayers.map((player, index) => (
          <View key={`${player.username}-${index}`} style={styles.playerRow}>
            <View>
              <Text style={styles.playerName}>{player.username}</Text>

              <Text style={styles.playerMeta}>
                {player.answersCount} / {player.totalQuestions} answered
              </Text>
            </View>

            <Text style={styles.status}>{player.finished ? "✅" : "⏳"}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
    textAlign: "center",
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
    color: colors.subtext,
    marginBottom: 24,
  },
  card: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: colors.text,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  playerName: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
    color: colors.text,
  },
  playerMeta: {
    fontSize: 14,
    color: colors.subtext,
  },

  status: {
    fontSize: 22,
  },
});
