import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { AuthContext } from "../context/AuthProvider";
import { auth, firestore } from "../../firebaseConfig";
import { doc, updateDoc } from "@react-native-firebase/firestore";

type RootStackParamList = {
  Home: undefined;
  BuisnessName: undefined;
  Tab: undefined;
};

type BusinessNameScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "BuisnessName"
>;

const BusinessNameScreen = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const navigation = useNavigation<BusinessNameScreenNavigationProp>();
  const { completeOnboarding } = useContext(AuthContext);

  const handlePermissionGranted = async () => {
    try {
      // Request contacts permission
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === "granted") {
        Alert.alert(
          "Success",
          "Contacts access granted! You can now manage your business contacts.",
          [{ text: "OK", onPress: () => {} }]
        );
      } else {
        Alert.alert(
          "Permission Denied",
          "Without contacts access, you'll need to add contacts manually.",
          [{ text: "OK", onPress: () => {} }]
        );
      }
    } catch (error) {
      console.error("Error requesting contacts permission:", error);
      Alert.alert(
        "Error",
        "There was an error requesting contacts permission.",
        [{ text: "OK", onPress: () => {} }]
      );
    }

    setShowPermissionModal(false);
    // Mark onboarding as complete regardless of permission status
    await completeOnboarding();
  };

  const handlePermissionDenied = async () => {
    setShowPermissionModal(false);
    // Mark onboarding as complete even if permission denied
    await completeOnboarding();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your business name");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user found");
      }

      // Update user document in Firestore
      await updateDoc(doc(firestore, "users", user.uid), {
        businessName: name.trim(),
        updatedAt: new Date(),
      });

      // Request contacts permission
      const { status } = await Contacts.requestPermissionsAsync();

      // Mark onboarding as complete regardless of permission status
      await completeOnboarding();

      // Navigate to home screen
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: "Tab" }],
      // });
    } catch (error: any) {
      console.error("Error saving business name:", error);
      Alert.alert("Error", error.message || "Failed to save business name");
    } finally {
      setLoading(false);
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
        style={[styles.button, (!name || loading) && styles.buttonDisabled]}
        disabled={!name || loading}
        onPress={handleSave}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Finish"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showPermissionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contacts Access</Text>
            <Text style={styles.modalText}>
              To help you manage your business contacts, we need access to your
              phone contacts.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.denyButton]}
                onPress={handlePermissionDenied}
              >
                <Text style={styles.denyButtonText}>Not Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.allowButton]}
                onPress={handlePermissionGranted}
              >
                <Text style={styles.allowButtonText}>Allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  denyButton: {
    backgroundColor: "#F5F6FA",
  },
  allowButton: {
    backgroundColor: "#2F51FF",
  },
  denyButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 15,
  },
  allowButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
