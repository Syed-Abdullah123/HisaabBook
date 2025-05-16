import { StyleSheet, Text, View } from "react-native";
import React from "react";

const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text>WelcomeScreen</Text>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
