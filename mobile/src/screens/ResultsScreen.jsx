import { useMemo, useState } from "react";
import { Text, TouchableOpacity, StyleSheet, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetRoom } from "../api/rooms";
import useGameStore from "../store/useGameStore";
import { clearRoomCodeFromStorage } from "../storage/userStorage";

export default function ResultsScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resetting, setResetting] = useState(false);

  const username = useGameStore((state) => state.username);
  const results = useGameStore((state) => state.results);
  const roomCode = useGameStore((state) => state.roomCode);
  const setRoom = useGameStore((state) => state.setRoom);
  const setSession = useGameStore((state) => state.setSession);
  const setResults = useGameStore((state) => state.setResults);
  const clearGame = useGameStore((state) => state.clearGame);

  const mismatches = results?.mismatches || [];

  const currentMismatch = useMemo(() => {
    return mismatches[currentIndex] || null;
  }, [mismatches, currentIndex]);

  const isLastMismatch = currentIndex === mismatches.length - 1;

  const handleNext = () => {
    if (!isLastMismatch) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePlayAgain = async () => {
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

  const handleExitToHome = async () => {
    await clearRoomCodeFromStorage();
    clearGame();
    navigation.replace("Home");
  };

  if (!results) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>No results available.</Text>
      </SafeAreaView>
    );
  }

  const renderAnswerRow = (item, index) => {
    const isYou = item.username.toLowerCase() === username.toLowerCase();

    return (
      <View
        key={`${item.username}-${index}`}
        style={[styles.answerCard, isYou && styles.youAnswerCard]}
      >
        <Text style={styles.answerLabel}>{isYou ? "You" : item.username}</Text>
        <Text style={styles.answerValue}>{item.answer.toUpperCase()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Results</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{results.matchesCount}</Text>
          <Text style={styles.summaryLabel}>Matches</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{results.mismatchesCount}</Text>
          <Text style={styles.summaryLabel}>Differences</Text>
        </View>
      </View>

      {mismatches.length === 0 ? (
        <View style={styles.resultCard}>
          <Text style={styles.noDifferencesEmoji}>🎉</Text>
          <Text style={styles.noDifferencesTitle}>
            No differences this round
          </Text>
          <Text style={styles.noDifferencesText}>
            You both answered the same on every completed question.
          </Text>
        </View>
      ) : (
        <View style={styles.resultCard}>
          <Text style={styles.progressText}>
            Difference {currentIndex + 1} / {mismatches.length}
          </Text>

          <Text style={styles.questionText}>
            {currentMismatch.questionText}
          </Text>

          <View style={styles.answersWrapper}>
            {currentMismatch.answers.map(renderAnswerRow)}
          </View>

          {!isLastMismatch ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.primaryButtonText}>Next Difference</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handlePlayAgain}
              disabled={resetting}
            >
              <Text style={styles.primaryButtonText}>
                {resetting ? "Resetting..." : "Play Again"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {mismatches.length > 0 && !isLastMismatch && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handlePlayAgain}
          disabled={resetting}
        >
          <Text style={styles.secondaryButtonText}>
            {resetting ? "Resetting..." : "Skip to Play Again"}
          </Text>
        </TouchableOpacity>
      )}

      {mismatches.length === 0 && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handlePlayAgain}
          disabled={resetting}
        >
          <Text style={styles.primaryButtonText}>
            {resetting ? "Resetting..." : "Play Again"}
          </Text>
        </TouchableOpacity>
      )}
      <br />
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleExitToHome}
      >
        <Text style={styles.secondaryButtonText}>Exit to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#ddd",
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  resultCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 18,
    padding: 24,
    marginBottom: 18,
  },
  progressText: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 14,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 32,
  },
  answersWrapper: {
    gap: 12,
    marginBottom: 24,
  },
  answerCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 16,
  },
  youAnswerCard: {
    borderColor: "#222",
  },
  answerLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  answerValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
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
    fontSize: 16,
  },
  noDifferencesEmoji: {
    fontSize: 42,
    textAlign: "center",
    marginBottom: 12,
  },
  noDifferencesTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  noDifferencesText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
  },
});
