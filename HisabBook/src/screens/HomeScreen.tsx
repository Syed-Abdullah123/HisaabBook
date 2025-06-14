import { Ionicons, EvilIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import auth from "@react-native-firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  doc as firestoreDoc,
} from "@react-native-firebase/firestore";
import { firestore } from "../../firebaseConfig";
import { cleanPhoneNumber } from "../utils/contactUtils";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

type KhaataEntry = {
  contactId: string;
  contactName: string;
  contactNumber: string;
  balance: number;
};

interface UserData {
  businessName: string;
}

const HomeScreen = () => {
  const [khaataList, setKhaataList] = useState<KhaataEntry[]>([]);
  const [filter, setFilter] = useState("all"); // "all" | "lene" | "dene"
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState<UserData>({ businessName: "" });
  const user = auth().currentUser;
  const navigation = useNavigation();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedContact, setSelectedContact] = useState<KhaataEntry | null>(
    null
  );
  const [contactsMap, setContactsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Fetch business name
    const fetchBusinessName = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData({
            businessName: data?.businessName || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessName();

    // Fetch contacts for filtering
    let contactsMap: Record<string, any> = {};
    const contactsQ = query(
      collection(firestore, "contacts"),
      where("userId", "==", user.uid)
    );
    const unsubContacts = onSnapshot(contactsQ, (snapshot) => {
      contactsMap = {};
      snapshot.forEach((doc) => {
        contactsMap[doc.id] = doc.data();
      });
      // Trigger a re-render by updating state (if needed)
      setContactsMap({ ...contactsMap });
    });

    // Fetch transactions
    const q = query(
      collection(firestore, "transactions"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const grouped: { [contactId: string]: KhaataEntry } = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          !data ||
          !data.contactId ||
          !data.contactName ||
          !data.contactNumber
        ) {
          // Skip malformed data
          return;
        }
        const contactId = data.contactId;
        // Only include if not deleted in contacts
        if (contactsMap[contactId] && contactsMap[contactId].deleted) return;
        if (!grouped[contactId]) {
          grouped[contactId] = {
            contactId,
            contactName: data.contactName,
            contactNumber: data.contactNumber,
            balance: 0,
          };
        }
        grouped[contactId].balance +=
          data.type === "diye" ? data.amount : -data.amount;
      });
      // Only show contacts with non-zero balance
      const list = Object.values(grouped).filter((c) => c.balance !== 0);
      setKhaataList(list);
      setLoading(false);
    });
    return () => {
      unsubscribe();
      unsubContacts();
    };
  }, [user]);

  // Filtering and Search
  const filteredList = khaataList.filter((c) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "lene" && c.balance > 0) ||
      (filter === "dene" && c.balance < 0);

    const matchesSearch =
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactNumber.includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  // Card totals
  const leneTotal = khaataList
    .filter((c) => c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0);
  const deneTotal = khaataList
    .filter((c) => c.balance < 0)
    .reduce((sum, c) => sum + Math.abs(c.balance), 0);

  const handleDeletePress = (contact: KhaataEntry) => {
    setSelectedContact(contact);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedContact) return;
    setDeleting(true);
    try {
      // Soft delete contact in Firestore
      await updateDoc(
        firestoreDoc(firestore, "contacts", selectedContact.contactId),
        {
          deleted: true,
          deletedAt: new Date(),
        }
      );
    } catch (e) {
      // Optionally show error
    }
    setDeleting(false);
    setDeleteModalVisible(false);
    setSelectedContact(null);
  };

  // Render contact row
  const renderContact = ({ item }: { item: KhaataEntry }) => (
    <TouchableOpacity
      style={styles.contactRow}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate("ContactDetails", {
          contact: { name: item.contactName, number: item.contactNumber },
        })
      }
      onLongPress={() => handleDeletePress(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.contactName[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.contactName}>{item.contactName}</Text>
        <Text style={styles.contactNumber}>{item.contactNumber}</Text>
      </View>
      <Text
        style={[
          styles.contactBalance,
          { color: item.balance < 0 ? "#F00000" : "#00A86B" },
        ]}
      >
        Rs.{Math.abs(item.balance)}
      </Text>
    </TouchableOpacity>
  );

  // Empty state
  if (!loading && khaataList.length === 0) {
    return (
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>
              {userData.businessName || " "}
            </Text>
            {/* <Ionicons name="chevron-down" size={18} color="black" /> */}
          </TouchableOpacity>
          <View style={styles.topIcons}>
            <TouchableOpacity>
              <EvilIcons name="refresh" size={32} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Cards */}
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name="arrow-down" size={24} color="#F00000" />
            </View>
            <Text style={[styles.cardLabel, { color: "#FF4D4F" }]}>
              Maine lene hain
            </Text>
            <Text style={styles.cardAmount}>Rs.0</Text>
          </View>
          <View style={styles.card}>
            <View style={[styles.cardIcon, { backgroundColor: "#2ECC4030" }]}>
              <Ionicons name="arrow-up" size={24} color="#2ECC40" />
            </View>
            <Text style={[styles.cardLabel, { color: "#2ECC40" }]}>
              Maine dene hain
            </Text>
            <Text style={styles.cardAmount}>Rs.0</Text>
          </View>
        </View>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../../assets/home-empty.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
          <Text style={styles.instruction}>
            Customer add karein aur unka hisaab kitab rakhna shuru karien
          </Text>
          <Image
            source={require("../../assets/arrow.png")}
            style={styles.illustrationArrow}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>
            {userData.businessName || " "}
          </Text>
        </TouchableOpacity>
        <View style={styles.topIcons}>
          {/* <TouchableOpacity>
            <EvilIcons name="refresh" size={32} color="black" />
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.pdfBtn}
            onPress={() => navigation.navigate("AllKhaataScreen" as never)}
          >
            <Ionicons name="document-text-outline" size={22} color="#F00000" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Cards */}
      <View style={styles.cardsRow}>
        <TouchableOpacity
          style={[styles.card, filter === "lene" && styles.cardSelected]}
          onPress={() => setFilter(filter === "lene" ? "all" : "lene")}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="arrow-down" size={24} color="#F00000" />
          </View>
          <Text style={[styles.cardLabel, { color: "#FF4D4F" }]}>
            Maine lene hain
          </Text>
          <Text style={styles.cardAmount}>Rs.{leneTotal}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.card, filter === "dene" && styles.cardSelected]}
          onPress={() => setFilter(filter === "dene" ? "all" : "dene")}
        >
          <View style={[styles.cardIcon, { backgroundColor: "#2ECC4030" }]}>
            <Ionicons name="arrow-up" size={24} color="#2ECC40" />
          </View>
          <Text style={[styles.cardLabel, { color: "#2ECC40" }]}>
            Maine dene hain
          </Text>
          <Text style={styles.cardAmount}>Rs.{deneTotal}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter and Search Bar */}
      <View style={styles.filterSearchContainer}>
        {filter !== "all" && (
          <TouchableOpacity
            style={styles.clearFilterBtn}
            onPress={() => setFilter("all")}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
            <Text style={styles.clearFilterText}>
              Clear {filter === "lene" ? "Lene" : "Dene"} Filter
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or number"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List of Khaatas */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2F51FF" />
        </View>
      ) : (
        <>
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item.contactId}
            renderItem={renderContact}
            contentContainerStyle={{ paddingBottom: 120, marginTop: 16 }}
            ListEmptyComponent={
              <Text
                style={{ textAlign: "center", color: "#888", marginTop: 32 }}
              >
                No khaata found for this filter.
              </Text>
            }
          />
          <Modal visible={deleteModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Ionicons
                  name="trash-outline"
                  size={36}
                  color="#F00000"
                  style={{ alignSelf: "center" }}
                />
                <Text style={styles.modalTitle}>Delete this contact?</Text>
                <Text style={styles.modalDesc}>
                  This will move the contact to Deleted Items. You can recover
                  it later from the Deleted Items section.
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setDeleteModalVisible(false)}
                    disabled={deleting}
                  >
                    <Text style={{ color: "#F00000", fontWeight: "600" }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteConfirmBtn}
                    onPress={handleDeleteConfirm}
                    disabled={deleting}
                  >
                    <Text style={styles.btnText}>
                      {deleting ? "Deleting..." : "Delete"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
  },
  dropdown: {
    // flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#F5F6FA",
    // borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 4,
  },
  dropdownText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  topIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pdfBtn: {
    marginLeft: 8,
    backgroundColor: "#F5F6FA",
    borderRadius: 8,
    padding: 6,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#F5F6FA90",
    borderRadius: 16,
    marginHorizontal: 6,
    alignItems: "center",
    paddingVertical: 24,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#2F51FF",
  },
  cardIcon: {
    backgroundColor: "#FA0B2930",
    borderRadius: 10,
    padding: 4,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  filterSearchContainer: {
    paddingHorizontal: 18,
    marginTop: 16,
    gap: 8,
  },
  clearFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F5F6FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  clearFilterText: {
    color: "#666",
    fontSize: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#222",
    padding: 0,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  illustration: {
    width: 160,
    height: 120,
    marginBottom: 18,
  },
  instruction: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 300,
  },
  illustrationArrow: {
    width: 100,
    height: 100,
    marginTop: 18,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F6FA",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#888",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  contactNumber: {
    fontSize: 13,
    color: "#888",
  },
  contactBalance: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    borderColor: "#F00000",
    borderRadius: 10,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
  },
  deleteConfirmBtn: {
    flex: 1,
    backgroundColor: "#F00000",
    borderRadius: 10,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
