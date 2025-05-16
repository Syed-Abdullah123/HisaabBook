import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import WelcomeScreen from "../screens/WelcomeScreen";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Welcome" component={WelcomeScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
