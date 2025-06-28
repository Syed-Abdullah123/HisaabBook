import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

type RootStackParamList = {
  Welcome: undefined;
  Create: undefined;
};

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AnimatedSplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  // Animations
  const centerBarScale = useRef(new Animated.Value(width / 80)).current; // Start as wide as screen
  const leftX = useRef(new Animated.Value(-width)).current;
  const rightX = useRef(new Animated.Value(width)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence: shrink center bar, slide in legs, fade in text
    Animated.sequence([
      Animated.parallel([
        Animated.timing(centerBarScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(leftX, {
          toValue: 0,
          duration: 1000,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rightX, {
          toValue: 0,
          duration: 1000,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if this is a sign-out case
    const checkNavigation = async () => {
      const isSignOut = await AsyncStorage.getItem("isSignOut");

      // Always navigate after 3 seconds
      setTimeout(() => {
        if (isSignOut === "true") {
          // If it's a sign-out, go directly to Create screen
          navigation.reset({
            index: 0,
            routes: [{ name: "Create" }],
          });
          // Clear the sign-out flag
          AsyncStorage.removeItem("isSignOut");
        } else {
          // Normal flow - go to Welcome screen
          navigation.navigate("Welcome");
        }
      }, 3000);
    };

    checkNavigation();
  }, []);

  return (
    <View style={styles.container}>
      {/* Center bar, starts as full width, scales down */}
      <Animated.Image
        source={require("../../assets/logo/mid.png")}
        style={[
          styles.bar,
          {
            transform: [{ scaleX: centerBarScale }],
          },
        ]}
        resizeMode="contain"
      />
      {/* Left leg */}
      <Animated.Image
        source={require("../../assets/logo/left.png")}
        style={[
          styles.leg,
          { left: width / 2 - 80, transform: [{ translateX: leftX }] },
        ]}
        resizeMode="contain"
      />
      {/* Right leg */}
      <Animated.Image
        source={require("../../assets/logo/right.png")}
        style={[
          styles.leg,
          { left: width / 2 + 32, transform: [{ translateX: rightX }] },
        ]}
        resizeMode="contain"
      />
      {/* App name */}
      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        HisaabBook
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  bar: {
    position: "absolute",
    top: height / 2 - 10,
    left: width / 2 - 40,
    width: 80,
    height: 24,
    zIndex: 2,
  },
  leg: {
    position: "absolute",
    top: height / 2 - 60,
    width: 48,
    height: 130,
    zIndex: 1,
  },
  appName: {
    position: "absolute",
    top: height / 2 + 80,
    alignSelf: "center",
    fontSize: 32,
    fontWeight: "bold",
    color: "#444",
  },
});
