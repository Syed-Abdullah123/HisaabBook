import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const BusinessNameScreen = () => {
  const [name, setName] = useState("");
  const navigation = useNavigation();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Karobar Ki Tafseel!</Text>
      <Text style={styles.subtitle}>Apne karobar ka naam likhein.</Text>
      <TextInput
        style={[styles.input, name && styles.inputActive]}
        placeholder="Karobar ka naam"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#B0B0B0"
      />
      <TouchableOpacity
        style={[styles.button, !name && styles.buttonDisabled]}
        disabled={!name}
        onPress={() => {
          navigation.navigate("Tab");
        }}
      >
        <Text style={styles.buttonText}>Finish</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default BusinessNameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 150,
  },
  backBtn: {
    marginBottom: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
    color: "#222",
    marginBottom: 20,
  },
  inputActive: {
    borderColor: "#2F51FF",
  },
  button: {
    backgroundColor: "#2F51FF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
