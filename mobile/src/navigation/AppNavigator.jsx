import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import CreateRoomScreen from "../screens/CreateRoomScreen";
import JoinRoomScreen from "../screens/JoinRoomScreen";
import LobbyScreen from "../screens/LobbyScreen";
import QuestionScreen from "../screens/QuestionScreen";
import WaitingScreen from "../screens/WaitingScreen";
import ResultsScreen from "../screens/ResultsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
        <Stack.Screen name="JoinRoom" component={JoinRoomScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="Question" component={QuestionScreen} />
        <Stack.Screen name="Waiting" component={WaitingScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
