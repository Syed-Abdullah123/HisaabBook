import MainNavigator from "./src/navigation/MainNavigator";
import { AuthProvider } from "./src/context/AuthProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
