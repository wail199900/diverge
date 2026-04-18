import { useMemo, useState } from "react";
import { Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { finishSession, submitAnswer } from "../api/sessions";
import useGameStore from "../store/useGameStore";

export default function QuestionScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const username = useGameStore((state) => state.username);
  const roomCode = useGameStore((state) => state.roomCode);
  const session = useGameStore((state) => state.session);

  const questions = session?.questions || [];
  const currentQuestion = useMemo(
    () => questions[currentIndex],
    [questions, currentIndex],
  );

  const handleAnswer = async (answer) => {
    if (!currentQuestion) return;

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
        await finishSession(roomCode, username);
        navigation.navigate("Waiting");
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
      <Text style={styles.progress}>
        Question {currentIndex + 1} / {questions.length}
      </Text>

      <Text style={styles.question}>{currentQuestion.text}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleAnswer("yes")}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>Yes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleAnswer("no")}
        disabled={submitting}
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
});
