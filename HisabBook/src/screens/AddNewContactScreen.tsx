import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { collection, addDoc } from "@react-native-firebase/firestore";
import { firestore } from "../../firebaseConfig";
import auth from "@react-native-firebase/auth";
import { cleanPhoneNumber } from "../utils/contactUtils";

const AddNewContactScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [saving, setSaving] = useState(false);

  const isFormValid = name.trim().length > 0 && number.trim().length > 0;

  const handleSave = async () => {
    if (!isFormValid) return;

    setSaving(true);
    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert("Error", "Please sign in to add contacts");
        return;
      }

      // Clean and validate phone number
      const cleanedNumber = cleanPhoneNumber(number);
      if (!cleanedNumber) {
        Alert.alert("Error", "Please enter a valid phone number");
        return;
      }

      // Add contact to Firestore
      const contactRef = await addDoc(collection(firestore, "contacts"), {
        name: name.trim(),
        number: cleanedNumber,
        userId: user.uid,
        createdAt: new Date(),
        deleted: false,
      });

      // Navigate to contact details with the new contact
      navigation.navigate("ContactDetails", {
        contact: {
          name: name.trim(),
          number: cleanedNumber,
          id: contactRef.id,
        },
      });
    } catch (error) {
      console.error("Error saving contact:", error);
      Alert.alert("Error", "Failed to save contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Add Karain</Text>
        </View>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color="#2F51FF" />
            <TouchableOpacity style={styles.cameraBtn}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter contact name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#B0B0B0"
          />
          <Text style={[styles.label, { marginTop: 18 }]}>Mobile Number</Text>
          <View style={styles.inputRow}>
            <Text style={styles.flag}>🇵🇰</Text>
            <TextInput
              style={[styles.input, styles.innerInput]}
              placeholder="Enter contact number"
              value={number}
              onChangeText={setNumber}
              keyboardType="number-pad"
              placeholderTextColor="#B0B0B0"
              maxLength={11}
            />
          </View>
        </View>
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.saveBtn, !isFormValid && styles.saveBtnDisabled]}
            disabled={!isFormValid || saving}
            onPress={handleSave}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Contact Save Karein</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddNewContactScreen;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 38,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
    textAlign: "center",
    marginRight: 32,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 18,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cameraBtn: {
    position: "absolute",
    right: 6,
    bottom: 6,
    backgroundColor: "#2F51FF",
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  label: {
    fontSize: 15,
    color: "#222",
    marginBottom: 8,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    height: 44,
    fontSize: 15,
    color: "#222",
    marginBottom: 0,
  },
  innerInput: {
    flex: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    marginLeft: 0,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 8,
    height: 44,
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#F5F6FA",
  },
  saveBtn: {
    backgroundColor: "#2F51FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#E0E0E0",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
