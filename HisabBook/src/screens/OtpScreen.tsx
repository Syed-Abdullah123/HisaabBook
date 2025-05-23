import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "@react-native-firebase/auth";
import {
  getConfirmationResult,
  clearConfirmationResult,
} from "../utils/authState";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 25;

type RootStackParamList = {
  Otp: {
    phone: string;
  };
  BuisnessName: undefined;
};

type OtpScreenRouteProp = RouteProp<RootStackParamList, "Otp">;
type OtpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Otp"
>;

const OtpScreen = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const navigation = useNavigation<OtpScreenNavigationProp>();
  const route = useRoute<OtpScreenRouteProp>();
  const { phone } = route.params;

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, navigate to main app
        navigation.navigate("BuisnessName");
      }
    });
    return subscriber; // unsubscribe on unmount
  }, [navigation]);

  useEffect(() => {
    if (timeLeft === 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleChange = (text: string, idx: number) => {
    if (!/^[0-9]?$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[idx] = text;
    setOtp(newOtp);

    if (text && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (!text && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    idx: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every((d) => d.length === 1);

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      Alert.alert("Error", "Please enter the complete verification code");
      return;
    }

    setLoading(true);
    try {
      const confirmation = getConfirmationResult();
      if (!confirmation) {
        throw new Error("Verification session expired. Please try again.");
      }
      await confirmation.confirm(otpString);
      clearConfirmationResult(); // Clear the confirmation after successful verification
      setLoading(false);
      // Navigation will be handled by the auth state listener
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
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>6-digit SMS Code Darj Karain!</Text>
      <Text style={styles.subtitle}>
        {phone} pay 6-digit code SMS kia gya ha.
      </Text>
      <View style={styles.otpRow}>
        {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
          <TextInput
            key={idx}
            ref={(ref) => {
              inputRefs.current[idx] = ref;
            }}
            style={[
              styles.otpInput,
              otp[idx] ? styles.otpInputActive : undefined,
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={otp[idx] || ""}
            onChangeText={(text) => handleChange(text, idx)}
            onKeyPress={(e) => handleKeyPress(e, idx)}
            autoFocus={idx === 0}
            textAlign="center"
          />
        ))}
      </View>
      <Text style={styles.resendText}>
        <Text style={{ color: "#2F51FF" }}>{timeLeft} second</Text> mai code
        dobra bheja jaega
      </Text>
      <TouchableOpacity
        style={[styles.button, !isOtpComplete && styles.buttonDisabled]}
        disabled={!isOtpComplete || loading}
        onPress={handleVerify}
      >
        <Text style={styles.buttonText}>
          {loading ? "Verifying..." : "Finish"}
        </Text>
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  otpInput: {
    width: 44,
    height: 54,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F6FA",
    fontSize: 22,
    color: "#222",
    textAlign: "center",
    marginHorizontal: 5, // For spacing if gap is not supported
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
