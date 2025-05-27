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
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { AuthContext } from "../context/AuthProvider";

const BusinessNameScreen = () => {
  const [name, setName] = useState("");
  const navigation = useNavigation();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const { completeOnboarding } = useContext(AuthContext);

  const handleFinish = () => {
    setShowPermissionModal(true);
  };

  const handlePermissionGranted = async () => {
    try {
      // Request contacts permission
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === "granted") {
        // Optional: You can fetch contacts here to verify permission works
        // const { data } = await Contacts.getContactsAsync({
        //   fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        // });
        // console.log('Contacts count:', data.length);

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
        onPress={handleFinish}
      >
        <Text style={styles.buttonText}>Finish</Text>
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
                <Text style={styles.allowButtonText}>Allow Access</Text>
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
