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
import { auth } from "../../firebaseConfig";
import {
  signInWithPhoneNumber,
  onAuthStateChanged,
} from "@react-native-firebase/auth";
import { setConfirmationResult } from "../utils/authState";

interface CreateAccountScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

// const PAKISTAN_FLAG = require("../../assets/pk-flag.png"); // Place a pk-flag.png in assets or use emoji fallback

const isValidPhone = (phone: string) => {
  // Accepts 11 or 12 digit numbers (without country code)
  return /^\d{11,12}$/.test(phone);
};

const CreateAccountScreen = () => {
  const [phone, setPhone] = useState("");
  const [isInputActive, setIsInputActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<CreateAccountScreenProps["navigation"]>();

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, navigate to main app
        navigation.navigate("BuisnessName");
      }
    });
    return subscriber; // unsubscribe on unmount
  }, [navigation]);

  const handleSendCode = async () => {
    if (!isValidPhone(phone)) {
      Alert.alert(
        "Invalid",
        "Please enter a valid 11-digit phone number starting with 03."
      );
      return;
    }
    setLoading(true);
    try {
      const phoneNumber = "+92" + phone.slice(1); // Convert 03xx... to +923xx...
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber);
      setConfirmationResult(confirmation); // Store confirmation in our state
      setLoading(false);
      navigation.navigate("Otp", {
        phone: phoneNumber,
      });
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message);
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
            isInputActive && styles.inputContainerActive,
          ]}
        >
          {/* Flag */}
          {/* If you don't have pk-flag.png, use emoji: <Text style={{fontSize:18}}>🇵🇰</Text> */}
          {/* <Image source={PAKISTAN_FLAG} style={styles.flag} /> */}
          <Text style={{ fontSize: 18, marginRight: 8 }}>🇵🇰</Text>
          <TextInput
            style={styles.input}
            placeholder=""
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
          style={[styles.button, !isValidPhone(phone) && styles.buttonDisabled]}
          disabled={!isValidPhone(phone) || loading}
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
    letterSpacing: 1,
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
