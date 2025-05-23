import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Image,
  Modal,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ContactHeader from "../components/ContactHeader";

const EntryFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const contact = route.params?.contact || { name: "Junaid" };
  const type = route.params?.type || "diye";

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("12th Feb,2025");
  const [showCallModal, setShowCallModal] = useState(false);
  // Dummy: no real audio or bill logic

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
          onCallPress={() => setShowCallModal(true)}
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
          />
          <View style={{ height: 16 }} />
          <View style={styles.noteRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Feb ki kameti"
              value={note}
              onChangeText={setNote}
              placeholderTextColor="#B0B0B0"
            />
            <TouchableOpacity style={styles.micBtn}>
              <Feather name="mic" size={20} color="#2F51FF" />
            </TouchableOpacity>
          </View>
          <View style={styles.audioRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="play" size={20} color="#2F51FF" />
              <Text style={{ marginHorizontal: 8, color: "#222" }}>0.11</Text>
            </View>
            <TouchableOpacity>
              <Feather name="trash-2" size={18} color="#F00000" />
            </TouchableOpacity>
          </View>
          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.optionBtn}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#2F51FF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.optionBtnText}>{date}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionBtn}>
              <Ionicons
                name="camera-outline"
                size={18}
                color="#2F51FF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.optionBtnText}>Add bills</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.billPreviewRow}>
            <Image
              source={require("../../assets/home-empty.png")}
              style={styles.billPreview}
              resizeMode="contain"
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => navigation.navigate("ContactHistory", { contact })}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>

        <Modal
          visible={showCallModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCallModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCallModal(false)}
          />
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EntryFormScreen;

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
  },
  formContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    height: 44,
    fontSize: 16,
    color: "#222",
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  micBtn: {
    marginLeft: 8,
    backgroundColor: "#F5F6FA",
    borderRadius: 8,
    padding: 10,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: "#F5F6FA",
    borderRadius: 8,
    padding: 8,
    width: "70%",
  },
  optionsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    // backgroundColor: "red",
    marginTop: 12,
    gap: 12,
  },
  optionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  optionBtnText: {
    color: "#222",
    fontSize: 14,
  },
  billPreviewRow: {
    marginTop: 16,
    alignItems: "flex-start",
  },
  billPreview: {
    width: 100,
    height: 130,
    borderRadius: 8,
    backgroundColor: "#F5F6FA",
  },
  saveBtn: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: "#2F51FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
});
