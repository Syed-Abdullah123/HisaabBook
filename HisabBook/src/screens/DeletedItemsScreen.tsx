import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ContactHeader from "../components/ContactHeader";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "@react-native-firebase/firestore";
import { firestore } from "../../firebaseConfig";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";

interface DeletedContact {
  id: string;
  name: string;
  number: string;
  deletedAt?: any;
}

const DUMMY_DELETED_CONTACTS = [
  { id: "1", name: "Junaid", number: "04235678901" },
  { id: "2", name: "Liam", number: "05567891234" },
  { id: "3", name: "Maya", number: "06678912345" },
];

const DeletedItemsScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [deletedContacts, setDeletedContacts] = useState<DeletedContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<DeletedContact | null>(
    null
  );
  const [recovering, setRecovering] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;
    setLoading(true);

    // Real-time deleted contacts updates
    const q = query(
      collection(firestore, "contacts"),
      where("userId", "==", user.uid),
      where("deleted", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: DeletedContact[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || "",
          number: data.number || "",
          deletedAt: data.deletedAt,
        });
      });
      setDeletedContacts(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRecoverPress = (contact: DeletedContact) => {
    setSelectedContact(contact);
    setModalVisible(true);
  };

  const handleRecoverConfirm = async () => {
    if (!selectedContact) return;
    setRecovering(true);
    try {
      const contactRef = doc(firestore, "contacts", selectedContact.id);
      await updateDoc(contactRef, {
        deleted: false,
        deletedAt: null,
      });
      // The onSnapshot listener will automatically update the UI
    } catch (error) {
      console.error("Error recovering contact:", error);
      Alert.alert("Error", "Failed to recover contact. Please try again.");
    } finally {
      setRecovering(false);
      setModalVisible(false);
      setSelectedContact(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deleted Items</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Deleted items recover karein.</Text>
        <Text style={styles.subtitle}>Items Deleting in 30 Days</Text>
        <FlatList
          data={deletedContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.contactRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.number}>{item.number}</Text>
              </View>
              <TouchableOpacity
                style={styles.recoverBtn}
                onPress={() => handleRecoverPress(item)}
              >
                <Ionicons name="refresh" size={16} color="#2F51FF" />
                <Text style={styles.recoverBtnText}>Recover</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
      {/* <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveBtnText}>Save Karien</Text>
      </TouchableOpacity> */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons
              name="refresh"
              size={36}
              color="#2F51FF"
              style={{ alignSelf: "center" }}
            />
            <Text style={styles.modalTitle}>Customer recover karein!?</Text>
            <Text style={styles.modalDesc}>
              Recover karne se aap ka total balance badal sakta hai
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={recovering}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.recoverConfirmBtn}
                onPress={handleRecoverConfirm}
                disabled={recovering}
              >
                <Text style={styles.recoverConfirmBtnText}>
                  {recovering ? "Recovering..." : "Recover Karien"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 38,
    paddingHorizontal: 24,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#888",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  number: {
    fontSize: 13,
    color: "#888",
  },
  recoverBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  recoverBtnText: {
    color: "#2F51FF",
    fontWeight: "600",
    marginLeft: 4,
  },
  saveBtn: {
    backgroundColor: "#2F51FF",
    margin: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    width: 320,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  modalDesc: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2F51FF",
    borderRadius: 10,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#2F51FF",
    fontWeight: "600",
  },
  recoverConfirmBtn: {
    flex: 1,
    backgroundColor: "#2F51FF",
    borderRadius: 10,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  recoverConfirmBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default DeletedItemsScreen;
