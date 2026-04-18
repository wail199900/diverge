import { useEffect } from "react";
import { Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getResults, getSessionProgress } from "../api/sessions";
import useGameStore from "../store/useGameStore";

export default function WaitingScreen({ navigation }) {
  const roomCode = useGameStore((state) => state.roomCode);
  const setResults = useGameStore((state) => state.setResults);

  useEffect(() => {
    let interval;

    const pollProgress = async () => {
      try {
        const progress = await getSessionProgress(roomCode);

        if (progress.status === "completed") {
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

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.title}>Waiting for the other player...</Text>
      <Text style={styles.subtitle}>Results will appear automatically.</Text>
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
  },
});
