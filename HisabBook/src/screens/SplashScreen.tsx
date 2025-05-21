import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  Image,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function AnimatedSplashScreen() {
  const navigation = useNavigation();
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

    // Always navigate after 3 seconds
    const timeout = setTimeout(() => {
      navigation.navigate("Welcome"); // or navigation.navigate('Welcome')
    }, 3000);

    return () => clearTimeout(timeout);
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
