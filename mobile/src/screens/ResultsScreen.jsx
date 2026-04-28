import { useMemo, useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetRoom } from "../api/rooms";
import useGameStore from "../store/useGameStore";
import { clearRoomCodeFromStorage } from "../storage/userStorage";
import colors from "../theme/colors";

export default function ResultsScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  const username = useGameStore((state) => state.username);
  const results = useGameStore((state) => state.results);
  const roomCode = useGameStore((state) => state.roomCode);
  const setRoom = useGameStore((state) => state.setRoom);
  const setSession = useGameStore((state) => state.setSession);
  const setResults = useGameStore((state) => state.setResults);
  const clearGame = useGameStore((state) => state.clearGame);

  const mismatches = results?.mismatches || [];
  const total = results?.totalQuestions || 0;
  const matches = results?.matchesCount || 0;
  const differences = results?.mismatchesCount || 0;

  const percentage = total > 0 ? Math.round((matches / total) * 100) : 0;

  const currentMismatch = useMemo(() => {
    return mismatches[currentIndex] || null;
  }, [mismatches, currentIndex]);

  const isLastMismatch = currentIndex === mismatches.length - 1;

  useEffect(() => {
    let start = 0;

    const interval = setInterval(() => {
      start += 2;

      if (start >= percentage) {
        start = percentage;
        clearInterval(interval);
      }

      setAnimatedScore(start);
    }, 18);

    return () => clearInterval(interval);
  }, [percentage]);

  const getScoreText = () => {
    if (percentage >= 80) return "Very aligned";
    if (percentage >= 60) return "Pretty close";
    if (percentage >= 40) return "Some surprises";
    return "Lots to talk about";
  };

  const handleNext = () => {
    if (!isLastMismatch) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const resetCurrentRoom = async () => {
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

  const handlePlayAgain = () => {
    Alert.alert(
      "Play again?",
      "This will reset the current room and start a new round.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Play Again",
          onPress: resetCurrentRoom,
        },
      ],
    );
  };

  const handleExitToHome = async () => {
    Alert.alert(
      "Exit to home?",
      "This will clear your saved room from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: async () => {
            await clearRoomCodeFromStorage();
            clearGame();
            navigation.replace("Home");
          },
        },
      ],
    );
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
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Results</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Compatibility</Text>
          <Text style={styles.scoreValue}>{animatedScore}%</Text>
          <Text style={styles.scoreSub}>{getScoreText()}</Text>
          <Text style={{ fontSize: 14, color: colors.subtext, marginTop: 6 }}>
            {matches} / {total} matches
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{matches}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{differences}</Text>
            <Text style={styles.statLabel}>Differences</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Questions</Text>
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

            {currentMismatch && (
              <>
                <Text style={styles.questionText}>
                  {currentMismatch.questionText}
                </Text>

                <View style={styles.answersWrapper}>
                  {currentMismatch.answers.map(renderAnswerRow)}
                </View>
              </>
            )}

            {!isLastMismatch ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>Next Difference</Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.endMessage}>
                  That’s all your differences 👀
                </Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handlePlayAgain}
                  disabled={resetting}
                >
                  <Text style={styles.primaryButtonText}>
                    {resetting ? "Resetting..." : "Play Again"}
                  </Text>
                </TouchableOpacity>
              </>
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
        <View style={styles.exitButtonWrapper}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleExitToHome}
          >
            <Text style={styles.exitButtonText}>Exit to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    color: colors.text,
    marginBottom: 18,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    textAlign: "center",
    color: colors.subtext,
    marginBottom: 14,
    fontWeight: "600",
  },
  questionText: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 22,
    color: colors.text,
    lineHeight: 32,
  },
  answersWrapper: {
    gap: 12,
    marginBottom: 24,
  },
  answerCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FAFAFA",
  },
  youAnswerCard: {
    borderColor: colors.primary,
    backgroundColor: "#F8FAFC",
  },
  answerLabel: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 6,
    fontWeight: "600",
  },
  answerValue: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 14,
  },
  primaryButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
    color: colors.primary,
  },
  exitButton: {
    paddingVertical: 14,
    marginTop: 4,
  },
  exitButtonText: {
    color: "#B91C1C",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },

  noDifferencesEmoji: {
    fontSize: 42,
    textAlign: "center",
    marginBottom: 12,
  },
  noDifferencesTitle: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
    color: colors.text,
  },
  noDifferencesText: {
    fontSize: 16,
    textAlign: "center",
    color: colors.subtext,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    color: colors.text,
  },

  scoreCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  scoreTitle: {
    fontSize: 16,
    color: colors.subtext,
    marginBottom: 8,
    fontWeight: "600",
  },

  scoreValue: {
    fontSize: 64,
    fontWeight: "900",
    color: colors.primary,
    lineHeight: 72,
  },

  scoreSub: {
    fontSize: 16,
    color: colors.text,
    marginTop: 8,
    fontWeight: "600",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.subtext,
    fontWeight: "600",
  },
  exitButtonWrapper: {
    marginTop: 14,
  },

  endMessage: {
    textAlign: "center",
    marginBottom: 12,
    fontSize: 15,
    color: colors.subtext,
    fontWeight: "500",
  },
});
