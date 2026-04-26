import AppNavigator from "./src/navigation/AppNavigator";
import { useEffect } from "react";
import { loadSounds } from "./src/utils/sounds";

export default function App() {
  useEffect(() => {
    loadSounds();
  }, []);
  return <AppNavigator />;
}
