import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import AddContact from "../screens/AddContactScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2F51FF",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          // paddingBottom: 15 + Math.max(insets.bottom, 0),
          height: 55 + Math.max(insets.bottom, 0),
          backgroundColor: "#fff",
        },
        tabBarItemStyle: {
          backgroundColor: "transparent",
        },
        tabBarButton: (props) => (
          <Pressable {...props} android_ripple={{ color: "transparent" }} />
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AddContact"
        component={AddContact}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.addButton}>
              <Ionicons name="add" size={32} color="#FFFFFF" />
            </View>
          ),
          title: "",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "#2F51FF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
});

export default TabNavigator;
