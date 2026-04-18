import { useMemo, useState, useEffect, useRef } from "react";
import { Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { finishSession, submitAnswer } from "../api/sessions";
import useGameStore from "../store/useGameStore";

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTimeUp = async () => {
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
  };

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
        <Text>No questions available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.timer}>⏱ {timeLeft}s</Text>
      <Text style={styles.progress}>
        Question {currentIndex + 1} / {questions.length}
      </Text>

      <Text style={styles.question}>{currentQuestion.text}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleAnswer("yes")}
        disabled={submitting || hasFinishedRef.current}
      >
        <Text style={styles.buttonText}>Yes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleAnswer("no")}
        disabled={submitting || hasFinishedRef.current}
      >
        <Text style={styles.buttonText}>No</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  progress: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  question: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#222",
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  timer: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
});
