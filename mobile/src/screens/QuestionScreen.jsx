import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
  Animated,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { finishSession, submitAnswer } from "../api/sessions";
import useGameStore from "../store/useGameStore";
import colors from "../theme/colors";
import * as Haptics from "expo-haptics";
import { playSwipeSound, playSuccessSound } from "../utils/sounds";

const SWIPE_THRESHOLD = 120;

export default function QuestionScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const hasFinishedRef = useRef(false);
  const position = useRef(new Animated.ValueXY()).current;

  const username = useGameStore((state) => state.username);
  const roomCode = useGameStore((state) => state.roomCode);
  const session = useGameStore((state) => state.session);

  const selectedCategory = session?.category || "all";

  const questions = useMemo(() => {
    return session?.questions || [];
  }, [session]);

  const currentQuestion = useMemo(
    () => questions[currentIndex],
    [questions, currentIndex],
  );

  const nextQuestion = useMemo(
    () => questions[currentIndex + 1],
    [questions, currentIndex],
  );

  const formattedCategory =
    selectedCategory === "all"
      ? "All"
      : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);

  const resetCardPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  }, [position]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );

    return () => backHandler.remove();
  }, []);

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

  const handleAnswer = useCallback(
    async (answer) => {
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
          playSuccessSound();
          hasFinishedRef.current = true;
          await finishSession(roomCode, username);
          navigation.replace("Waiting");
          return;
        }

        if (isLastQuestion) {
          hasFinishedRef.current = true;
          await finishSession(roomCode, username);
          navigation.replace("Waiting");
          return;
        }
        position.setValue({ x: 0, y: 0 });
        setCurrentIndex((prev) => prev + 1);
      } catch (error) {
        resetCardPosition();
        Alert.alert(
          "Error",
          error?.response?.data?.message || "Failed to submit answer",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      currentQuestion,
      submitting,
      roomCode,
      username,
      currentIndex,
      questions.length,
      navigation,
      position,
      resetCardPosition,
    ],
  );
  const swipeCardOut = useCallback(
    (direction, answer) => {
      Animated.timing(position, {
        toValue: {
          x: direction === "right" ? 500 : -500,
          y: 0,
        },
        duration: 220,
        useNativeDriver: false,
      }).start(() => {
        handleAnswer(answer);
      });
    },
    [position, handleAnswer],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () =>
          !submitting && !hasFinishedRef.current,
        onMoveShouldSetPanResponder: () =>
          !submitting && !hasFinishedRef.current,

        onPanResponderMove: (_, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy });
        },

        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD || velocity > 0.8) {
            playSwipeSound();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swipeCardOut("right", "yes");
            return;
          }

          if (gesture.dx < -SWIPE_THRESHOLD || velocity < -0.8) {
            playSwipeSound();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swipeCardOut("left", "no");
            return;
          }
          const velocity = gesture.vx;
          if (gesture.dx > SWIPE_THRESHOLD || velocity > 0.8) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swipeCardOut("right", "yes");
            return;
          }

          if (gesture.dx < -SWIPE_THRESHOLD || velocity < -0.8) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            swipeCardOut("left", "no");
            return;
          }

          resetCardPosition();
        },
      }),
    [position, resetCardPosition, swipeCardOut, submitting],
  );

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
  const rotate = position.x.interpolate({
    inputRange: [-220, 0, 220],
    outputRange: ["-8deg", "0deg", "8deg"],
    extrapolate: "clamp",
  });
  const yesOpacity = position.x.interpolate({
    inputRange: [20, 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const noOpacity = position.x.interpolate({
    inputRange: [-120, -20],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const nextScale = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [1, 0.96, 1],
    extrapolate: "clamp",
  });

  const nextOpacity = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [1, 0.55, 1],
    extrapolate: "clamp",
  });

  const nextTranslateY = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [0, 18, 0],
  });
  const yesScale = position.x.interpolate({
    inputRange: [20, 120],
    outputRange: [0.8, 1.2],
    extrapolate: "clamp",
  });
  const noScale = position.x.interpolate({
    inputRange: [-120, -20],
    outputRange: [1.2, 0.8],
    extrapolate: "clamp",
  });

  const bgColor = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ["#FEE2E2", colors.background, "#DCFCE7"],
    extrapolate: "clamp",
  });
  return (
    <Animated.View style={{ flex: 1, backgroundColor: bgColor }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>⏱ {timeLeft}s</Text>
          </View>
        </View>
        <Text style={styles.categoryText}>Category: {formattedCategory}</Text>

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

        <View style={styles.cardStack}>
          {nextQuestion && (
            <Animated.View
              style={[
                styles.card,
                styles.nextCard,
                {
                  transform: [
                    { scale: nextScale },
                    { translateY: nextTranslateY },
                  ],
                  opacity: nextOpacity,
                },
              ]}
            >
              <Text style={styles.questionText}>{nextQuestion.text}</Text>
            </Animated.View>
          )}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              styles.activeCard,
              {
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate },
                ],
              },
            ]}
          >
            <Animated.Text
              style={[
                styles.yesLabel,
                { opacity: yesOpacity, transform: [{ scale: yesScale }] },
              ]}
            >
              YES
            </Animated.Text>

            <Animated.Text
              style={[
                styles.noLabel,
                { opacity: noOpacity, transform: [{ scale: noScale }] },
              ]}
            >
              NO
            </Animated.Text>

            <Text style={styles.questionText}>{currentQuestion.text}</Text>

            <Text style={styles.swipeHint}>
              Swipe right for YES, left for NO
            </Text>
          </Animated.View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => swipeCardOut("left", "no")}
            disabled={submitting || hasFinishedRef.current}
          >
            <Text style={styles.secondaryButtonText}>No</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => swipeCardOut("right", "yes")}
            disabled={submitting || hasFinishedRef.current}
          >
            <Text style={styles.primaryButtonText}>
              {submitting ? "Submitting..." : "Yes"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
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
    borderRadius: 24,
    padding: 28,
    minHeight: 300,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
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

  categoryText: {
    textAlign: "center",
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 14,
  },
  swipeHint: {
    textAlign: "center",
    color: colors.subtext,
    fontSize: 14,
    marginTop: 24,
  },

  yesLabel: {
    position: "absolute",
    top: 24,
    left: 24,
    fontSize: 28,
    fontWeight: "800",
    color: "#16A34A",
    borderWidth: 3,
    borderColor: "#16A34A",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    transform: [{ rotate: "-10deg" }],
  },

  noLabel: {
    position: "absolute",
    top: 24,
    right: 24,
    fontSize: 28,
    fontWeight: "800",
    color: "#DC2626",
    borderWidth: 3,
    borderColor: "#DC2626",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    transform: [{ rotate: "10deg" }],
  },

  cardStack: {
    position: "relative",
    minHeight: 320,
    marginBottom: 24,
  },

  activeCard: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },

  nextCard: {
    position: "absolute",
    top: 18,
    left: 12,
    right: 12,
    zIndex: 1,
    opacity: 0.55,
    transform: [{ scale: 0.96 }],
  },
});
