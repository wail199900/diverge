import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Diverge</Text>
      <Text style={styles.subtitle}>Discover where answers split.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateRoom")}
      >
        <Text style={styles.buttonText}>Creat Room</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("JoinRoom")}
      >
        <Text style={styles.buttonText}>Join Room</Text>
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

  title: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#222",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
