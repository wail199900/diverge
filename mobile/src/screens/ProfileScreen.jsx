import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getAvatarFromStorage,
  getUsernameFromStorage,
  saveAvatarToStorage,
  saveUsernameToStorage,
} from "../storage/userStorage";
import useGameStore from "../store/useGameStore";
import colors from "../theme/colors";

export default function ProfileScreen({ navigation }) {
  const [username, setUsernameInput] = useState("");
  const [avatar, setAvatar] = useState("😀");
  const [saving, setSaving] = useState(false);

  const setUsername = useGameStore((state) => state.setUsername);
  const setAvatarInStore = useGameStore((state) => state.setAvatar);

  const avatarOptions = ["😀", "😎", "🔥", "🧠", "🎯", "🚀", "👾", "🐼"];

  useEffect(() => {
    const loadSavedProfile = async () => {
      const savedUsername = await getUsernameFromStorage();
      const savedAvatar = await getAvatarFromStorage();

      if (savedUsername) setUsernameInput(savedUsername);
      if (savedAvatar) setAvatar(savedAvatar);
    };

    loadSavedProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      Alert.alert("Validation", "Please enter a username");
      return;
    }

    try {
      setSaving(true);

      const trimmedUsername = username.trim();

      await saveUsernameToStorage(trimmedUsername);
      await saveAvatarToStorage(avatar);

      setUsername(trimmedUsername);
      setAvatarInStore(avatar);

      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>Choose how you appear in the game.</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsernameInput}
          placeholder="Enter username"
          placeholderTextColor={colors.subtext}
          style={styles.input}
        />

        <Text style={styles.label}>Avatar</Text>
        <View style={styles.avatarRow}>
          {avatarOptions.map((item) => {
            const isSelected = avatar === item;

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.avatarChip,
                  isSelected && styles.avatarChipSelected,
                ]}
                onPress={() => setAvatar(item)}
              >
                <Text style={styles.avatarText}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveProfile}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Save Profile"}
          </Text>
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
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.subtext,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    color: colors.text,
  },
  avatarRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },
  avatarChip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: colors.surface,
  },
  avatarChipSelected: {
    borderColor: colors.primary,
    backgroundColor: "#EEF2FF",
  },
  avatarText: {
    fontSize: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  buttonText: {
    color: colors.primaryText,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});
