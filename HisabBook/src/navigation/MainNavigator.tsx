import TabNavigator from "./TabNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import OtpScreen from "../screens/OtpScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import BuisnessNameScreen from "../screens/BuisnessNameScreen";
const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Create" component={CreateAccountScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="BuisnessName" component={BuisnessNameScreen} />
        <Stack.Screen name="Tab" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
