import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "@react-native-firebase/firestore";
import ContactHeader from "../components/ContactHeader";
import { firestore } from "../../firebaseConfig";
import auth from "@react-native-firebase/auth";
import { cleanPhoneNumber } from "../utils/contactUtils";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Contact {
  name: string;
  number: string;
  balance: number;
}

interface Transaction {
  id: string;
  contactId: string;
  date: Date;
  type: "diye" | "liye";
  amount: number;
  note: string;
  imageUri?: string;
  createdAt: Date;
}

type RootStackParamList = {
  EntryForm: {
    contact: Contact;
    type: "diye" | "liye";
    transaction?: Transaction;
  };
};

const ContactDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const contact: Contact = route.params?.contact || {
    name: "Junaid",
    number: "03012451021",
    balance: 0,
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWasooliModal, setShowWasooliModal] = useState(false);
  const [selectedWasooliOption, setSelectedWasooliOption] = useState<
    "week" | "month" | null
  >(null);
  const [customWasooliDate, setCustomWasooliDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [wasooliDate, setWasooliDate] = useState<Date | null>(null);

  // Create a unique contact ID based on phone number
  const contactId = cleanPhoneNumber(contact.number); // Remove non-digits
  const user = auth().currentUser;

  // Real-time listener for transactions
  useEffect(() => {
    const transactionsRef = collection(firestore, "transactions");
    const user = auth().currentUser;
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(
      transactionsRef,
      where("contactId", "==", contactId),
      where("userId", "==", user.uid),
      // orderBy("date", "desc")
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const transactionsList: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          transactionsList.push({
            id: doc.id,
            contactId: data.contactId,
            date:
              data.date && data.date.toDate ? data.date.toDate() : new Date(),
            type: data.type,
            amount: data.amount,
            note: data.note || "",
            imageUri: data.imageUri,
            createdAt:
              data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate()
                : new Date(),
          });
        });
        setTransactions(transactionsList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [contactId]);

  // Calculate balance and determine if it's "dene hain" or "lene hain"
  useEffect(() => {
    const newBalance = transactions.reduce((acc, transaction) => {
      return (
        acc +
        (transaction.type === "diye" ? transaction.amount : -transaction.amount)
      );
    }, 0);
    setBalance(newBalance);
  }, [transactions]);

  useEffect(() => {
    const fetchWasooliDate = async () => {
      if (!user) return;
      const docRef = doc(firestore, "wasooliDates", `${user.uid}_${contactId}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.wasooliDate && data.wasooliDate.toDate) {
          setWasooliDate(data.wasooliDate.toDate());
        }
      }
    };
    fetchWasooliDate();
  }, [user, contactId]);

  const balanceType = balance > 0 ? "lene hain" : "dene hain";

  function getWasooliMessage() {
    let date: Date | null = null;
    if (selectedWasooliOption === "week") {
      date = new Date();
      date.setDate(date.getDate() + 7);
    } else if (selectedWasooliOption === "month") {
      date = new Date();
      date.setMonth(date.getMonth() + 1);
    } else if (customWasooliDate) {
      date = customWasooliDate;
    }
    if (date) {
      return `${date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })} ko ${contact.name} ko wasooli ke liye automatic SMS bheja jaega.`;
    }
    return "Wasooli ki tareekh select karien.";
  }

  const saveWasooliDate = async (date: Date | null) => {
    if (!user) return;
    try {
      await setDoc(doc(firestore, "wasooliDates", `${user.uid}_${contactId}`), {
        userId: user.uid,
        contactId,
        wasooliDate: date,
      });
      console.log("Wasooli date saved:", date);
    } catch (e) {
      console.error("Error saving wasooli date:", e);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.transactionRow}
      onPress={() =>
        navigation.navigate("EntryForm", {
          contact,
          type: item.type,
          transaction: item, // Pass the entire transaction object
        })
      }
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.transactionDate}>
          {item.date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>
        {item.note && <Text style={styles.transactionNote}>{item.note}</Text>}

        {item.imageUri && (
          <TouchableOpacity style={styles.imageIndicator}>
            <Ionicons name="image-outline" size={16} color="#2F51FF" />
            <Text style={styles.imageIndicatorText}>Bill attached</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.transactionAmountCol}>
        {item.type === "diye" ? (
          <Text style={styles.transactionDiye}>Rs. {item.amount}</Text>
        ) : (
          <Text style={styles.transactionEmpty}> </Text>
        )}
      </View>
      <View style={styles.transactionAmountCol}>
        {item.type === "liye" ? (
          <Text style={styles.transactionLiye}>Rs. {item.amount}</Text>
        ) : (
          <Text style={styles.transactionEmpty}> </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ContactHeader
          name={contact.name}
          number={contact.number}
          onBackPress={() => navigation.goBack()}
          onMenuPress={() => {}}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F51FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ContactHeader
        name={contact.name}
        number={contact.number}
        onBackPress={() => navigation.goBack()}
        onMenuPress={() => {}}
      />

      <View style={styles.balanceCard}>
        <View style={styles.balanceLeftColumn}>
          <Text style={styles.balanceType}>Maine {balanceType}</Text>
          <Text style={styles.balanceAmount}>Rs.{Math.abs(balance)}</Text>
          <TouchableOpacity
            style={styles.wasooliBtn}
            onPress={() => setShowWasooliModal(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#888"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.wasooliBtnText}>
              {wasooliDate
                ? wasooliDate.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Wasooli Date"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.balanceRightColumn}>
          <TouchableOpacity
            style={[styles.balanceActionBtnCol, { marginTop: 0 }]}
          >
            <Ionicons
              name="document-text-outline"
              size={18}
              color="#F00000"
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.balanceActionTextCol, { color: "#F00000" }]}>
              Report
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.balanceActionBtnCol}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color="#2F51FF"
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.balanceActionTextCol, { color: "#2F51FF" }]}>
              SMS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.balanceActionBtnCol}>
            <Ionicons
              name="logo-whatsapp"
              size={18}
              color="#25D366"
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.balanceActionTextCol, { color: "#25D366" }]}>
              WhatsApp
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../../assets/home-empty.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
          <Text style={styles.instruction}>
            Customer ka hisab kitaab shuru karne ke liye pehli entry darj krien
          </Text>
          <Ionicons
            name="arrow-down"
            size={32}
            color="#B0B0B0"
            style={{ marginTop: 16 }}
          />
        </View>
      ) : (
        <>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeader, { flex: 1 }]}>Date</Text>
            <Text style={styles.tableHeader}>Maine Diye</Text>
            <Text style={styles.tableHeader}>Maine Liye</Text>
          </View>
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransaction}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.redBtn]}
          onPress={() =>
            navigation.navigate("EntryForm", { contact, type: "diye" })
          }
        >
          <Ionicons
            name="arrow-up"
            size={20}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.actionBtnText}>Maine Diye</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.greenBtn]}
          onPress={() =>
            navigation.navigate("EntryForm", { contact, type: "liye" })
          }
        >
          <Ionicons
            name="arrow-down"
            size={20}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.actionBtnText}>Maine Liye</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showWasooliModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWasooliModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowWasooliModal(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.dragIndicator} />
            {/* Illustration */}
            <View style={{ alignItems: "center", marginBottom: 12 }}>
              <Ionicons name="cash-outline" size={40} color="#2F51FF" />
            </View>
            <Text style={styles.modalTitle}>Wasooli ki tareekh set karien</Text>
            <Text style={styles.modalSubtitle}>{getWasooliMessage()}</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  selectedWasooliOption === "week" && styles.optionBtnSelected,
                ]}
                onPress={() => {
                  if (selectedWasooliOption === "week") {
                    setSelectedWasooliOption(null);
                    setWasooliDate(null);
                  } else {
                    const date = new Date();
                    date.setDate(date.getDate() + 7);
                    setWasooliDate(date);
                    setSelectedWasooliOption("week");
                    setShowWasooliModal(false);
                    saveWasooliDate(date);
                  }
                }}
              >
                <Text
                  style={[
                    styles.optionBtnText,
                    selectedWasooliOption === "week" &&
                      styles.optionBtnTextSelected,
                  ]}
                >
                  Agla Hafta
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionBtn,
                  selectedWasooliOption === "month" && styles.optionBtnSelected,
                ]}
                onPress={() => {
                  if (selectedWasooliOption === "month") {
                    setSelectedWasooliOption(null);
                    setWasooliDate(null);
                  } else {
                    const date = new Date();
                    date.setMonth(date.getMonth() + 1);
                    setWasooliDate(date);
                    setSelectedWasooliOption("month");
                    setShowWasooliModal(false);
                    saveWasooliDate(date);
                  }
                }}
              >
                <Text
                  style={[
                    styles.optionBtnText,
                    selectedWasooliOption === "month" &&
                      styles.optionBtnTextSelected,
                  ]}
                >
                  Agla Mahina
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#2F51FF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.dateBtnText}>
                {customWasooliDate
                  ? customWasooliDate.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Tareekh darj karein"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={customWasooliDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) {
                setCustomWasooliDate(date);
                setWasooliDate(date); // set the main date
                setSelectedWasooliOption(null); // Deselect quick options
                setShowWasooliModal(false); // close modal
                saveWasooliDate(date);
              }
            }}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default ContactDetailsScreen;

const styles = StyleSheet.create({
  balanceCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: 18,
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 18,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceLeftColumn: {
    flex: 1.5,
    justifyContent: "flex-start",
  },
  balanceRightColumn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  balanceType: {
    fontSize: 15,
    color: "#666",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  wasooliBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  wasooliBtnText: {
    fontSize: 13,
    color: "#888",
  },
  balanceActionBtnCol: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    minWidth: 110,
    justifyContent: "flex-start",
  },
  balanceActionTextCol: {
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },
  illustrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 16,
  },
  illustration: {
    width: 200,
    height: 200,
    marginBottom: 18,
  },
  instruction: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 300,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#F5F5F5",
  },
  tableHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    width: 100,
    textAlign: "center",
  },
  transactionRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  transactionDate: {
    fontSize: 14,
    color: "#222",
    marginBottom: 4,
  },
  transactionNote: {
    fontSize: 12,
    color: "#666",
  },
  imageIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  imageIndicatorText: {
    fontSize: 10,
    color: "#2F51FF",
    marginLeft: 4,
  },
  transactionAmountCol: {
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionDiye: {
    fontSize: 14,
    color: "#F00000",
    fontWeight: "500",
  },
  transactionLiye: {
    fontSize: 14,
    color: "#00A86B",
    fontWeight: "500",
  },
  transactionEmpty: {
    fontSize: 14,
    color: "transparent",
  },
  bottomRow: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
  redBtn: {
    backgroundColor: "#F00000",
  },
  greenBtn: {
    backgroundColor: "#00A86B",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  dragIndicator: {
    width: 56,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 18,
  },
  optionRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 12,
  },
  optionBtn: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  optionBtnSelected: {
    backgroundColor: "#2F51FF",
  },
  optionBtnText: {
    color: "#222",
    fontWeight: "600",
    fontSize: 15,
  },
  optionBtnTextSelected: {
    color: "#fff",
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    width: "100%",
    justifyContent: "center",
  },
  dateBtnText: {
    color: "#2F51FF",
    fontWeight: "600",
    fontSize: 15,
  },
});
