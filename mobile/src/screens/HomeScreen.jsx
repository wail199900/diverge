import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../theme/colors";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Diverge</Text>
        <Text style={styles.subtitle}>Discover where answers split.</Text>
      </View>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("CreateRoom")}
        >
          <Text style={styles.buttonText}>Creat Room</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("JoinRoom")}
        >
          <Text style={styles.secondaryButtonText}>Join Room</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("History")}
        >
          <Text style={styles.secondaryButtonText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.secondaryButtonText}>Profile</Text>
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

  hero: {
    marginBottom: 28,
  },

  title: {
    fontSize: 40,
    fontWeight: "700",
    textAlign: "center",
    color: colors.text,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: colors.subtext,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
  },

  button: {
    borderRadius: 14,
    backgroundColor: colors.primary,
    marginBottom: 14,
    paddingVertical: 16,
  },
  buttonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 12,
  },

  secondaryButtonText: {
    color: colors.primary,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
