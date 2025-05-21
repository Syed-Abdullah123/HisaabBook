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
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 25;

type RootStackParamList = {
  Otp: {
    phone: string;
    confirmation: FirebaseAuthTypes.ConfirmationResult;
  };
  BuisnessName: undefined;
};

type OtpScreenRouteProp = RouteProp<RootStackParamList, "Otp">;
type OtpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Otp"
>;

const OtpScreen = () => {
  const navigation = useNavigation<OtpScreenNavigationProp>();
  const route = useRoute<OtpScreenRouteProp>();
  const phone = route.params.phone;
  const confirmation = route.params.confirmation;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, idx: number) => {
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

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    idx: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every((d) => d.length === 1);

  const handleVerify = async () => {
    if (!isOtpComplete) return;
    setLoading(true);
    try {
      const code = otp.join("");
      await confirmation.confirm(code);
      setLoading(false);
      // Navigate to your next screen (e.g., BuisnessName)
      navigation.navigate("BuisnessName");
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
      <Text style={styles.title}>4-digit SMS Code Darj Karain!</Text>
      <Text style={styles.subtitle}>
        {phone} pay 6-digit code SMS kia gya ha.
      </Text>
      <View style={styles.otpRow}>
        {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
          <TextInput
            key={idx}
            ref={(ref) => {
              inputs.current[idx] = ref;
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
        <Text style={{ color: "#2F51FF" }}>{timer} second</Text> mai code dobra
        bheja jaega
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
    paddingHorizontal: 24, // Add horizontal padding
    gap: 10, // Or use marginHorizontal in otpInput if gap is not supported
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
