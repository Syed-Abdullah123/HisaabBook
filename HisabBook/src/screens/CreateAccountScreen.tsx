import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { auth, firestore } from "../../firebaseConfig";
import {
  signInWithPhoneNumber,
  onAuthStateChanged,
} from "@react-native-firebase/auth";
import { setConfirmationResult } from "../utils/authState";
import { doc, setDoc } from "@react-native-firebase/firestore";

interface CreateAccountScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

// const PAKISTAN_FLAG = require("../../assets/pk-flag.png"); // Place a pk-flag.png in assets or use emoji fallback

const isValidPhone = (phone: string) => {
  // Accepts 11 or 12 digit numbers (without country code)
  return /^\d{11,12}$/.test(phone);
};

const CreateAccountScreen: React.FC<CreateAccountScreenProps> = () => {
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [isInputActive, setIsInputActive] = useState(false);
  const [isUsernameActive, setIsUsernameActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<CreateAccountScreenProps["navigation"]>();

  const handleSendCode = async () => {
    if (!phone || !username) {
      Alert.alert("Error", "Please enter both phone number and username");
      return;
    }

    if (phone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      // Format phone number to include country code
      const formattedPhone = phone.startsWith("0")
        ? `+92${phone.slice(1)}`
        : phone;

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone);
      setConfirmationResult(confirmation);
      navigation.navigate("Otp", {
        phone: formattedPhone,
        username,
      });
    } catch (error: any) {
      console.error("Error sending code:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1 }} />
      <View style={styles.content}>
        <Text style={styles.title}>Apna Mobile Number Darj Karain!</Text>
        <Text style={styles.subtitle}>
          Aap ko 6-digit ka code SMS par bheja jayega.
        </Text>
        <View
          style={[
            styles.inputContainer,
            isUsernameActive && styles.inputContainerActive,
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Aapka username"
            keyboardType="default"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#B0B0B0"
            onFocus={() => setIsUsernameActive(true)}
            onBlur={() => setIsUsernameActive(false)}
          />
        </View>
        <View
          style={[
            styles.inputContainer,
            isInputActive && styles.inputContainerActive,
          ]}
        >
          {/* Flag */}
          {/* If you don't have pk-flag.png, use emoji: <Text style={{fontSize:18}}>🇵🇰</Text> */}
          {/* <Image source={PAKISTAN_FLAG} style={styles.flag} /> */}
          {/* <Text style={{ fontSize: 18, marginRight: 8 }}>🇵🇰</Text> */}
          <TextInput
            style={styles.input}
            placeholder="Aapka mobile number"
            keyboardType="number-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={11}
            placeholderTextColor="#B0B0B0"
            onFocus={() => setIsInputActive(true)}
            onBlur={() => setIsInputActive(false)}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            (!isValidPhone(phone) || !username.length) && styles.buttonDisabled,
          ]}
          disabled={!isValidPhone(phone) || !username.length || loading}
          onPress={handleSendCode}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Mobile Number Verify Karain"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 2 }} />
    </KeyboardAvoidingView>
  );
};

export default CreateAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 24,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputContainerActive: {
    borderColor: "#2F51FF",
  },
  flag: {
    width: 24,
    height: 18,
    marginRight: 8,
    resizeMode: "contain",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#222",
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
