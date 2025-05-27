import MainNavigator from "./src/navigation/MainNavigator";
import { AuthProvider } from "./src/context/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}
