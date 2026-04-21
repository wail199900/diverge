import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Text, TouchableOpacity, StyleSheet, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { finishSession, submitAnswer } from "../api/sessions";
import useGameStore from "../store/useGameStore";
import colors from "../theme/colors";

export default function QuestionScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const hasFinishedRef = useRef(false);

  const username = useGameStore((state) => state.username);
  const roomCode = useGameStore((state) => state.roomCode);
  const session = useGameStore((state) => state.session);

  const questions = useMemo(() => {
    return session?.questions || [];
  }, [session]);

  const currentQuestion = useMemo(
    () => questions[currentIndex],
    [questions, currentIndex],
  );

  const handleTimeUp = useCallback(async () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    try {
      await finishSession(roomCode, username);
      navigation.replace("Waiting");
    } catch (error) {
      if (error?.response?.status === 400) {
        Alert.alert(
          "Time's up",
          error?.response?.data?.message || "Round ended.",
        );
      } else {
        Alert.alert(
          "Error",
          error?.response?.data?.message || "Failed to finish session",
        );
      }
      navigation.replace("Waiting");
    }
  }, [roomCode, username, navigation]);

  useEffect(() => {
    if (!session?.endsAt) return;

    const updateTimer = () => {
      const endTime = new Date(session.endsAt).getTime();
      const now = Date.now();
      const remainingMs = endTime - now;
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      setTimeLeft(remainingSeconds);
      if (remainingSeconds <= 0) {
        handleTimeUp();
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session, handleTimeUp]);

  const handleAnswer = async (answer) => {
    if (!currentQuestion || submitting || hasFinishedRef.current) return;

    try {
      setSubmitting(true);

      await submitAnswer({
        roomCode,
        username,
        questionId: currentQuestion._id,
        answer,
      });

      const isLastQuestion = currentIndex === questions.length - 1;

      if (isLastQuestion) {
        hasFinishedRef.current = true;
        await finishSession(roomCode, username);
        navigation.replace("Waiting");
        return;
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to submit answer",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No questions available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progressPercent =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>⏱ {timeLeft}s</Text>
        </View>
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} / {questions.length}
        </Text>
        <View style={styles.progressBarTrack}>
          <View
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.questionText}>{currentQuestion.text}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => handleAnswer("yes")}
          disabled={submitting || hasFinishedRef.current}
        >
          <Text style={styles.primaryButtonText}>
            {" "}
            {submitting ? "Submitting..." : "Yes"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => handleAnswer("no")}
          disabled={submitting || hasFinishedRef.current}
        >
          <Text style={styles.secondaryButtonText}>No</Text>
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

  topRow: {
    alignItems: "center",
    marginBottom: 18,
  },

  timerBadge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  timerText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  progressHeader: {
    marginBottom: 20,
  },

  progressText: {
    fontSize: 15,
    marginBottom: 10,
    textAlign: "center",
    color: colors.subtext,
  },

  progressBarTrack: {
    height: 10,
    backgroundColor: "#ECEEF3",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 999,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 28,
    marginBottom: 24,
    minHeight: 240,
    justifyContent: "center",
  },

  questionText: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 38,
    color: colors.text,
  },

  actions: {
    gap: 14,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
  },
  primaryButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    paddingVertical: 18,
    borderRadius: 14,
  },

  secondaryButtonText: {
    color: colors.primary,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },

  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 24,
  },

  emptyText: {
    fontSize: 18,
    textAlign: "center",
    color: colors.text,
  },
});
