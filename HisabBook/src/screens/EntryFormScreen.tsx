import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  setDoc,
} from "@react-native-firebase/firestore";
import { firestore } from "../../firebaseConfig";
import auth from "@react-native-firebase/auth";
import ContactHeader from "../components/ContactHeader";
import { cleanPhoneNumber } from "../utils/contactUtils";

const EntryFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const contact = route.params?.contact || { name: "Junaid", id: "default" };
  const type = route.params?.type || "diye";
  const transaction = route.params?.transaction; // Get the transaction if it exists

  const [amount, setAmount] = useState(transaction?.amount?.toString() || "");
  const [note, setNote] = useState(transaction?.note || "");
  const [date, setDate] = useState(transaction?.date || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(
    transaction?.imageUri || null
  );
  const [saving, setSaving] = useState(false);

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!amount) {
      Alert.alert("Error", "Please enter an amount");
      return;
    }

    if (isNaN(parseFloat(amount))) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setSaving(true);

    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to save a transaction.");
        setSaving(false);
        return;
      }

      // Generate contactId from phone number
      const contactId = cleanPhoneNumber(contact.number);
      if (!contactId) {
        Alert.alert("Error", "Contact ID is missing.");
        setSaving(false);
        return;
      }

      const transactionData = {
        contactId: contactId,
        contactName: contact.name,
        contactNumber: contact.number,
        date: date,
        type: type,
        amount: parseFloat(amount),
        note: note.trim(),
        imageUri: imageUri || null,
        createdAt: serverTimestamp(),
        userId: user.uid,
      };

      if (transaction) {
        // Update existing transaction
        await updateDoc(
          doc(firestore, "transactions", transaction.id),
          transactionData
        );
        // Upsert contact
        await setDoc(
          doc(firestore, "contacts", contactId),
          {
            name: contact.name,
            number: contact.number,
            userId: user.uid,
            deleted: false,
            deletedAt: null,
          },
          { merge: true }
        );
        Alert.alert("Success", "Transaction updated successfully!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        // Create new transaction
        await addDoc(collection(firestore, "transactions"), transactionData);
        // Upsert contact
        await setDoc(
          doc(firestore, "contacts", contactId),
          {
            name: contact.name,
            number: contact.number,
            userId: user.uid,
            deleted: false,
            deletedAt: null,
          },
          { merge: true }
        );
        Alert.alert("Success", "Transaction saved successfully!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      Alert.alert("Error", "Failed to save transaction. Please try again.");
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
        <ContactHeader
          name={contact.name}
          number={contact.number}
          onBackPress={() => navigation.goBack()}
          onMenuPress={() => {}}
        />

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Rs. 3500"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor="#B0B0B0"
            editable={!saving}
          />

          <View style={{ height: 16 }} />

          <View style={styles.noteRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Feb ki kameti (optional)"
              value={note}
              onChangeText={setNote}
              placeholderTextColor="#B0B0B0"
              editable={!saving}
            />
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.optionBtn}
              onPress={() => setShowDatePicker(true)}
              disabled={saving}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#2F51FF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.optionBtnText}>{formattedDate}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <TouchableOpacity
              style={styles.optionBtn}
              onPress={handlePickImage}
              disabled={saving}
            >
              <Ionicons
                name="camera-outline"
                size={18}
                color="#2F51FF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.optionBtnText}>Add bills</Text>
            </TouchableOpacity>
          </View>

          {imageUri && (
            <View style={styles.billPreviewRow}>
              <Image
                source={{ uri: imageUri }}
                style={styles.billPreview}
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {transaction ? "Update" : "Save"}
            </Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EntryFormScreen;

const styles = StyleSheet.create({
  formContainer: {
    padding: 24,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#222",
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  micBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  audioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  optionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 12,
  },
  optionBtnText: {
    color: "#222",
    fontSize: 14,
  },
  billPreviewRow: {
    marginTop: 24,
    alignItems: "center",
  },
  billPreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  saveBtn: {
    backgroundColor: "#2F51FF",
    margin: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#adb5bd",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
