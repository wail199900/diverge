import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getRoom, updateRoomCategory } from "../api/rooms";
import { getActiveSession, startSession } from "../api/sessions";
import useGameStore from "../store/useGameStore";
import colors from "../theme/colors";
import { clearRoomCodeFromStorage } from "../storage/userStorage";
import * as Clipboard from "expo-clipboard";

export default function LobbyScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const hasNavigatedRef = useRef(false);

  const username = useGameStore((state) => state.username);
  const roomCode = useGameStore((state) => state.roomCode);
  const room = useGameStore((state) => state.room);
  const setRoom = useGameStore((state) => state.setRoom);
  const setSession = useGameStore((state) => state.setSession);
  const selectedCategory = room?.selectedCategory || "all";

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(roomCode);
      Alert.alert("Copied!", "Room code copied to clipboard.");
    } catch (error) {
      Alert.alert("Error", "Failed to copy code");
    }
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join my Diverge game! Room code: ${roomCode}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share room code");
    }
  };
  const handleLeaveRoom = async () => {
    Alert.alert(
      "Leave room?",
      "You will lose access to this active room unless you rejoin with the room code.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            await clearRoomCodeFromStorage();

            setRoom(null);
            setSession(null);

            navigation.replace("Home");
          },
        },
      ],
    );
  };

  const refreshRoom = useCallback(async () => {
    try {
      const updatedRoom = await getRoom(roomCode);
      setRoom(updatedRoom);
    } catch (error) {
      console.log(
        "Failed to refresh room:",
        error?.response?.data || error.message,
      );
    }
  }, [roomCode, setRoom]);

  const checkForStartedSession = useCallback(async () => {
    try {
      const sessionData = await getActiveSession(roomCode);

      if (sessionData && !hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        setSession(sessionData);
        navigation.replace("Question");
      }
    } catch (error) {
      // 404 here is normal if session has not started yet
      if (error?.response?.status !== 404) {
        console.log(
          "Failed to check active session:",
          error?.response?.data || error.message,
        );
      }
    }
  }, [roomCode, setSession, navigation]);

  const handleStartGame = async () => {
    try {
      setLoading(true);
      const sessionData = await startSession(roomCode);
      setSession(sessionData);
      hasNavigatedRef.current = true;
      navigation.replace("Question");
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to start game",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (category) => {
    try {
      const response = await updateRoomCategory(roomCode, username, category);
      setRoom(response.room);
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update category",
      );
    }
  };

  useEffect(() => {
    refreshRoom();
    checkForStartedSession();

    const interval = setInterval(() => {
      refreshRoom();
      checkForStartedSession();
    }, 300);

    return () => clearInterval(interval);
  }, [refreshRoom, checkForStartedSession]);

  const isHost = room?.players?.[0]?.username === username;
  const canStart = room?.players?.length === 2;

  const categories = [
    { label: "All", value: "all" },
    { label: "Fun", value: "fun" },
    { label: "Deep", value: "deep" },
    { label: "Dating", value: "dating" },
    { label: "Friends", value: "friends" },
    { label: "General", value: "general" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Lobby</Text>
      <Text style={styles.roomCode}>Room Code: {roomCode}</Text>
      <View style={styles.roomActions}>
        <TouchableOpacity style={styles.smallButton} onPress={handleCopyCode}>
          <Text style={styles.smallButtonText}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={handleShareCode}>
          <Text style={styles.smallButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Players</Text>
        {room?.players?.map((player, index) => {
          const isYou = player.username === username;
          return (
            <View key={`${player.username}-${index}`} style={styles.playerRow}>
              <View style={styles.playerIdentity}>
                <Text style={styles.playerAvatar}>{player.avatar || "😀"}</Text>
                <Text style={styles.playerName}>
                  {player.username} {isYou ? "(You)" : ""}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Category</Text>

        {isHost ? (
          <View style={styles.categoryGrid}>
            {categories.map((category) => {
              const isSelected = selectedCategory === category.value;

              return (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                  onPress={() => handleCategoryChange(category.value)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.readOnlyCategoryBox}>
            <Text style={styles.readOnlyCategoryLabel}>Selected by host</Text>
            <Text style={styles.readOnlyCategoryValue}>
              {selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={refreshRoom}>
        <Text style={styles.secondaryButtonText}>Refresh Lobby</Text>
      </TouchableOpacity>

      {isHost && (
        <TouchableOpacity
          style={[styles.primaryButton, !canStart && styles.disabledButton]}
          onPress={handleStartGame}
          disabled={!canStart || loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Starting..." : "Start Game"}
          </Text>
        </TouchableOpacity>
      )}

      {!isHost && (
        <Text style={styles.infoText}>
          Waiting for the host to start the game...
        </Text>
      )}

      <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveRoom}>
        <Text style={styles.leaveButtonText}>Leave Room</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    color: colors.text,
  },

  roomCode: {
    fontSize: 17,
    textAlign: "center",
    marginBottom: 24,
    color: colors.subtext,
  },

  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 14,
    color: colors.text,
  },

  playerRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },

  playerName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },

  primaryButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 14,
    marginTop: 12,
  },

  primaryButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },

  disabledButton: {
    opacity: 0.5,
  },

  infoText: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 16,
    color: colors.subtext,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  categoryChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginRight: 10,
    marginBottom: 10,
  },

  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryChipText: {
    color: colors.text,
    fontWeight: "500",
  },

  categoryChipTextSelected: {
    color: colors.primaryText,
  },

  readOnlyCategoryBox: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 16,
  },

  readOnlyCategoryLabel: {
    fontSize: 13,
    color: colors.subtext,
    marginBottom: 6,
  },

  readOnlyCategoryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },

  playerIdentity: {
    flexDirection: "row",
    alignItems: "center",
  },

  playerAvatar: {
    fontSize: 24,
    marginRight: 10,
  },

  leaveButton: {
    backgroundColor: "#B91C1C",
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
  },

  leaveButtonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  roomActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },

  smallButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  smallButtonText: {
    color: colors.primary,
    fontWeight: "600",
  },
});
