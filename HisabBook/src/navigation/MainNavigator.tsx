import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthProvider";

import WelcomeScreen from "../screens/WelcomeScreen";
import OtpScreen from "../screens/OtpScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import BuisnessNameScreen from "../screens/BuisnessNameScreen";
import TabNavigator from "./TabNavigator";
import ContactDetailsScreen from "../screens/ContactDetailsScreen";
import EntryFormScreen from "../screens/EntryFormScreen";
import ContactHistoryScreen from "../screens/ContactHistoryScreen";
import AddNewContactScreen from "../screens/AddNewContactScreen";
import SplashScreen from "../screens/SplashScreen";

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Create" component={CreateAccountScreen} />
    <Stack.Screen name="Otp" component={OtpScreen} />
    <Stack.Screen name="BuisnessName" component={BuisnessNameScreen} />
  </Stack.Navigator>
);

const OnboardingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BuisnessName" component={BuisnessNameScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tab" component={TabNavigator} />
    <Stack.Screen name="ContactDetails" component={ContactDetailsScreen} />
    <Stack.Screen name="EntryForm" component={EntryFormScreen} />
    <Stack.Screen name="ContactHistory" component={ContactHistoryScreen} />
    <Stack.Screen name="AddNewContact" component={AddNewContactScreen} />
  </Stack.Navigator>
);

const MainNavigator = () => {
  const { user, isOnboardingComplete } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : !isOnboardingComplete ? (
        <OnboardingStack />
      ) : (
        <AppStack />
      )}
    </NavigationContainer>
  );
};

export default MainNavigator;
