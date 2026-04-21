import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getSessionHistory } from "../api/sessions";
import useGameStore from "../store/useGameStore";
import colors from "../theme/colors";

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const username = useGameStore((state) => state.username);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!username) {
          setLoading(false);
          return;
        }

        const data = await getSessionHistory(username);
        setHistory(data);
      } catch (error) {
        Alert.alert(
          "Error",
          error?.response?.data?.message || "Failed to load history",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [username]);

  const renderItem = ({ item }) => {
    const formattedCategory =
      item.category === "all"
        ? "All"
        : item.category.charAt(0).toUpperCase() + item.category.slice(1);

    const formattedDate = new Date(item.completedAt).toLocaleString();

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("HistoryDetails", {
            sessionId: item.sessionId,
          })
        }
      >
        <Text style={styles.roomCode}>Room: {item.roomCode}</Text>
        <Text style={styles.meta}>Category: {formattedCategory}</Text>
        <Text style={styles.meta}>Matches: {item.matchesCount}</Text>
        <Text style={styles.meta}>Differences: {item.mismatchesCount}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </TouchableOpacity>
    );
  };

  if (!username) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Play at least one game before checking history.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Game History</Text>

      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No completed games yet.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.sessionId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  roomCode: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  meta: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: colors.subtext,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 24,
    marginTop: 20,
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
    marginTop: 40,
  },
});
