import { useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getSessionDetails } from "../api/sessions";
import colors from "../theme/colors";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function HistoryDetailsScreen({ route }) {
  const { sessionId } = route.params;
  const [details, setDetails] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getSessionDetails(sessionId);
      setDetails(data);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to load session details",
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading session details..." />
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message={errorMessage} onRetry={fetchDetails} />
      </SafeAreaView>
    );
  }

  if (!details) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading session details...</Text>
      </SafeAreaView>
    );
  }

  const mismatches = details.mismatches || [];
  const currentMismatch = mismatches[currentIndex];
  const isLastMismatch = currentIndex === mismatches.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Past Game</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Room: {details.roomCode}</Text>
        <Text style={styles.summaryText}>Matches: {details.matchesCount}</Text>
        <Text style={styles.summaryText}>
          Differences: {details.mismatchesCount}
        </Text>
      </View>

      {mismatches.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>No differences in this game.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.progressText}>
            Difference {currentIndex + 1} / {mismatches.length}
          </Text>

          <Text style={styles.questionText}>
            {currentMismatch.questionText}
          </Text>

          {currentMismatch.answers.map((item, index) => (
            <View key={`${item.username}-${index}`} style={styles.answerCard}>
              <Text style={styles.answerLabel}>{item.username}</Text>
              <Text style={styles.answerValue}>
                {item.answer.toUpperCase()}
              </Text>
            </View>
          ))}

          {!isLastMismatch && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setCurrentIndex((prev) => prev + 1)}
            >
              <Text style={styles.primaryButtonText}>Next Difference</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  summaryText: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 6,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 22,
  },
  progressText: {
    textAlign: "center",
    color: colors.subtext,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
    textAlign: "center",
    color: colors.text,
    marginBottom: 20,
  },
  answerCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 4,
  },
  answerValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  primaryButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: colors.subtext,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: colors.subtext,
  },
});
