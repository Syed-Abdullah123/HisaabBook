import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const OTP_LENGTH = 4;
const RESEND_SECONDS = 25;

const OtpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const phone = route.params?.phone || "";

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(RESEND_SECONDS);

  const inputs = useRef([]);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text, idx) => {
    if (!/^[0-9]?$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[idx] = text;
    setOtp(newOtp);

    if (text && idx < OTP_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
    if (!text && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every((d) => d.length === 1);

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
      <Text style={styles.title}>4-digit SMS Code Darj Karain!</Text>
      <Text style={styles.subtitle}>
        {phone} pay 4-digit code SMS kia gya ha.
      </Text>
      <View style={styles.otpRow}>
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={(ref) => (inputs.current[idx] = ref)}
            style={[styles.otpInput, digit ? styles.otpInputActive : undefined]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, idx)}
            onKeyPress={(e) => handleKeyPress(e, idx)}
            autoFocus={idx === 0}
            textAlign="center"
          />
        ))}
      </View>
      <Text style={styles.resendText}>
        <Text style={{ color: "#2F51FF" }}>{timer} second</Text> mai code dobra
        bheja jaega
      </Text>
      <TouchableOpacity
        style={[styles.button, !isOtpComplete && styles.buttonDisabled]}
        disabled={!isOtpComplete}
        onPress={() => navigation.navigate("BuisnessName")}
      >
        <Text style={styles.buttonText}>Finish</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default OtpScreen;

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
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  otpInput: {
    width: 60,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F6FA",
    fontSize: 22,
    color: "#222",
  },
  otpInputActive: {
    borderColor: "#2F51FF",
  },
  resendText: {
    color: "#888",
    fontSize: 13,
    marginBottom: 24,
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
