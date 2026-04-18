import { useState } from "react";
import { Text, TouchableOpacity, StyleSheet, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetRoom } from "../api/rooms";
import useGameStore from "../store/useGameStore";

export default function ResultsScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resetting, setResetting] = useState(false);

  const results = useGameStore((state) => state.results);
  const roomCode = useGameStore((state) => state.roomCode);
  const setRoom = useGameStore((state) => state.setRoom);
  const setSession = useGameStore((state) => state.setSession);
  const setResults = useGameStore((state) => state.setResults);

  const mismatches = results?.mismatches || [];
  const currentMismatch = mismatches[currentIndex];

  const handleNext = () => {
    if (currentIndex < mismatches.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleReplay = async () => {
    try {
      setResetting(true);

      const response = await resetRoom(roomCode);
      setRoom(response.room);
      setSession(null);
      setResults(null);

      navigation.replace("Lobby");
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to reset room",
      );
    } finally {
      setResetting(false);
    }
  };

  if (!results) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No results available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Results</Text>
      <Text style={styles.summary}>
        Matches: {results.matchesCount} | Differences: {results.mismatchesCount}
      </Text>

      {mismatches.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.question}>No differences this round 🎉</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.progress}>
            Difference {currentIndex + 1} / {mismatches.length}
          </Text>

          <Text style={styles.question}>{currentMismatch.questionText}</Text>

          {currentMismatch.answers.map((item, index) => (
            <Text key={`${item.username}-${index}`} style={styles.answer}>
              {item.username}: {item.answer.toUpperCase()}
            </Text>
          ))}

          <TouchableOpacity
            style={[
              styles.button,
              currentIndex === mismatches.length - 1 && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={currentIndex === mismatches.length - 1}
          >
            <Text style={styles.buttonText}>Next Difference</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleReplay}
        disabled={resetting}
      >
        <Text style={styles.secondaryButtonText}>
          {resetting ? "Resetting..." : "Play Again"}
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
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  summary: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  progress: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
    color: "#666",
  },
  question: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  answer: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
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
});
