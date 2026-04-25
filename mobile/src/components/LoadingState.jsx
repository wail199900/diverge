import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";

export default function LoadingState({ message = "Loading..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  message: {
    marginTop: 14,
    fontSize: 16,
    color: colors.subtext,
    textAlign: "center",
  },
});
