import AppNavigator from "./src/navigation/AppNavigator";
import { useEffect } from "react";
import { loadSounds } from "./src/utils/sounds";
import { StatusBar } from "expo-status-bar";

export default function App() {
  useEffect(() => {
    loadSounds();
  }, []);
  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}
