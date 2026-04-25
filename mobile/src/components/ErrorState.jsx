import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../theme/colors";

export default function ErrorState({
  message = "Something went wrong",
  onRetry,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Oops</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetry ? (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: colors.subtext,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  buttonText: {
    color: colors.primaryText,
    fontWeight: "600",
  },
});
