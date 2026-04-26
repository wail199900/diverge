import { Text, StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../theme/colors";

export default function HowToPlayScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>How to Play</Text>

        <View style={styles.card}>
          <Text style={styles.step}>1. Create or join a room</Text>
          <Text style={styles.step}>2. Wait for your friend</Text>
          <Text style={styles.step}>3. Host chooses a category</Text>
          <Text style={styles.step}>
            4. Answer 10 questions as fast as possible
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Swipe Controls</Text>

          <Text style={styles.swipeYes}>➡️ Swipe right = YES</Text>
          <Text style={styles.swipeNo}>⬅️ Swipe left = NO</Text>

          <Text style={styles.tip}>
            Tip: Swipe quickly for faster gameplay ⚡
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Goal</Text>

          <Text style={styles.description}>
            After both players finish, Diverge shows where your answers differ.
          </Text>

          <Text style={styles.description}>
            The more differences, the more interesting the conversation 👀
          </Text>
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
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
  },
  step: {
    fontSize: 16,
    marginBottom: 10,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: colors.text,
  },
  swipeYes: {
    fontSize: 16,
    marginBottom: 8,
    color: "#16A34A",
    fontWeight: "600",
  },
  swipeNo: {
    fontSize: 16,
    marginBottom: 12,
    color: "#DC2626",
    fontWeight: "600",
  },
  tip: {
    fontSize: 14,
    color: colors.subtext,
  },
  description: {
    fontSize: 15,
    marginBottom: 10,
    color: colors.text,
  },
});
