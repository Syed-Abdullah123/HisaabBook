import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Platform,
  LogBox,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import auth from "@react-native-firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "@react-native-firebase/firestore";
import { firestore } from "../../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

type Transaction = {
  id: string;
  contactName: string;
  date: Date;
  type: "diye" | "liye";
  amount: number;
};

const AllKhaataScreen = () => {
  const navigation = useNavigation();
  const user = auth().currentUser;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let q = query(
      collection(firestore, "transactions"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot) return; // defensive skip if snapshot is null
      const list: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          !data ||
          !data.contactName ||
          !data.date ||
          !data.type ||
          !data.amount
        )
          return;
        const txDate =
          data.date && data.date.toDate ? data.date.toDate() : new Date();
        list.push({
          id: doc.id,
          contactName: data.contactName,
          date: txDate,
          type: data.type,
          amount: data.amount,
        });
      });
      setTransactions(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Filter by date range
  const filteredTransactions = transactions.filter((tx) => {
    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;
    return true;
  });

  // Date formatting
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    ", " +
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  LogBox.ignoreLogs([
    "Warning: Text strings must be rendered within a <Text> component",
  ]);

  // Render each row
  const renderRow = ({ item }: { item: Transaction }) => (
    <View style={styles.tableRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.contactName}>{item.contactName}</Text>
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.amountCol}>
        {item.type === "diye" ? (
          <Text style={styles.amountDiye}>Rs. {item.amount}</Text>
        ) : null}
      </View>
      <View style={styles.amountCol}>
        {item.type === "liye" ? (
          <Text style={styles.amountLiye}>Rs. {item.amount}</Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sare Contacts ki Report</Text>
        <View style={{ width: 28 }}>
          <Text> </Text>
        </View>
      </View>

      {/* Date Filters */}
      <View style={styles.dateFilterRow}>
        <TouchableOpacity
          style={styles.datePickerBtn}
          onPress={() => setShowStartPicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color="#2F51FF" />
          <Text style={styles.datePickerText}>
            {startDate ? formatDate(startDate).split(",")[0] : "Start Date"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.datePickerBtn}
          onPress={() => setShowEndPicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color="#2F51FF" />
          <Text style={styles.datePickerText}>
            {endDate ? formatDate(endDate).split(",")[0] : "End Date"}
          </Text>
        </TouchableOpacity>
      </View>
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      {/* Table Header */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeader, { flex: 1 }]}>Date</Text>
        <Text style={styles.tableHeader}>Maine Diye</Text>
        <Text style={styles.tableHeader}>Maine Liye</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F51FF" />
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#888", marginTop: 32 }}>
              No transactions found for this filter.
            </Text>
          }
        />
      )}

      {/* Share & Download Buttons */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => {
            /* TODO: WhatsApp share */
          }}
        >
          <Ionicons
            name="logo-whatsapp"
            size={22}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={() => {
            /* TODO: Download logic */
          }}
        >
          <Ionicons
            name="download-outline"
            size={22}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.downloadBtnText}>Download</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AllKhaataScreen;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 38,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  dateFilterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 8,
    gap: 12,
  },
  datePickerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  datePickerText: {
    color: "#222",
    fontSize: 14,
    marginLeft: 8,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
  },
  tableHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    width: 100,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#fff",
  },
  contactName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
  },
  dateText: {
    fontSize: 12,
    color: "#888",
  },
  amountCol: {
    width: 100,
    alignItems: "center",
  },
  amountDiye: {
    fontSize: 14,
    color: "#F00000",
    fontWeight: "500",
  },
  amountLiye: {
    fontSize: 14,
    color: "#00A86B",
    fontWeight: "500",
  },
  bottomRow: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 24,
    flexDirection: "row",
    gap: 12,
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
  },
  shareBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  downloadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2F51FF",
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
  },
  downloadBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
