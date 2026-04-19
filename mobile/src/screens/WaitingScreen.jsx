import { useEffect, useState } from "react";
import { Text, StyleSheet, ActivityIndicator, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getResults, getSessionProgress } from "../api/sessions";
import useGameStore from "../store/useGameStore";

export default function WaitingScreen({ navigation }) {
  const [progress, setProgress] = useState(null);

  const roomCode = useGameStore((state) => state.roomCode);
  const username = useGameStore((state) => state.username);
  const setResults = useGameStore((state) => state.setResults);

  useEffect(() => {
    let interval;

    const pollProgress = async () => {
      try {
        const progressData = await getSessionProgress(roomCode);
        setProgress(progressData);

        if (progressData.status === "completed") {
          clearInterval(interval);

          const results = await getResults(roomCode);
          setResults(results);

          navigation.replace("Results");
        }
      } catch (error) {
        clearInterval(interval);
        Alert.alert(
          "Error",
          error?.response?.data?.message || "Failed to fetch session progress",
        );
      }
    };

    pollProgress();
    interval = setInterval(pollProgress, 2000);

    return () => clearInterval(interval);
  }, [roomCode, setResults, navigation]);

  const players = progress?.players || [];

  const currentPlayer = players.find(
    (player) => player.username.toLowerCase() === username.toLowerCase(),
  );

  const otherPlayers = players.filter(
    (player) => player.username.toLowerCase() !== username.toLowerCase(),
  );

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
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
  },
  card: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  playerName: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  playerMeta: {
    fontSize: 14,
    color: "#666",
  },

  status: {
    fontSize: 22,
  },
});
