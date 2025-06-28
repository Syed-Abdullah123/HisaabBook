import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ContactHeader from "../components/ContactHeader";

const DUMMY_TRANSACTIONS = [
  {
    id: "1",
    date: "12th Feb, 04:35PM",
    type: "liye",
    amount: 300,
    balance: 3050,
  },
  {
    id: "2",
    date: "12th Feb, 04:35PM",
    type: "liye",
    amount: 450,
    balance: 3050,
  },
  {
    id: "3",
    date: "12th Feb, 04:35PM",
    type: "diye",
    amount: 3800,
    balance: 3800,
  },
];

const ContactHistoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const contact = route.params?.contact || {
    name: "Junaid",
    number: "03012451021",
  };

  // Calculate balance and main color
  const balance = 3500;
  const balanceType = "lene hain"; // or "dene hain"

  const renderTransaction = ({
    item,
  }: {
    item: (typeof DUMMY_TRANSACTIONS)[0];
  }) => (
    <View style={styles.transactionRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.transactionDate}>{item.date}</Text>
        <View style={styles.transactionBalanceTag}>
          <Text style={styles.transactionBalanceText}>
            Bal. Rs. {item.balance}
          </Text>
        </View>
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
    </View>
  );

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
          <Text style={styles.balanceType}>Maine {balanceType} hain</Text>
          <Text style={styles.balanceAmount}>Rs.{balance}</Text>
          <TouchableOpacity style={styles.wasooliBtn}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#888"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.wasooliBtnText}>Wasooli Date</Text>
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

      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeader, { flex: 1 }]}>Date</Text>
        <Text style={styles.tableHeader}>Maine Diye</Text>
        <Text style={styles.tableHeader}>Maine Liye</Text>
      </View>
      <FlatList
        data={DUMMY_TRANSACTIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
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
    </SafeAreaView>
  );
};

export default ContactHistoryScreen;

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
  wasooliBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  wasooliBtnText: {
    color: "#888",
    fontWeight: "600",
    fontSize: 13,
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
  balanceType: {
    fontSize: 15,
    color: "#222",
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F00000",
    marginBottom: 0,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#F5F6FA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  tableHeader: {
    flex: 1,
    fontWeight: "bold",
    color: "#888",
    fontSize: 13,
    textAlign: "center",
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#F5F6FA",
    marginHorizontal: 16,
    paddingVertical: 12,
  },
  transactionDate: {
    fontSize: 13,
    color: "#888",
    marginBottom: 2,
  },
  transactionBalanceTag: {
    backgroundColor: "#F5F6FA",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  transactionBalanceText: {
    color: "#2ECC40",
    fontSize: 12,
    fontWeight: "bold",
  },
  transactionAmountCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionDiye: {
    color: "#F00000",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  transactionLiye: {
    color: "#2ECC40",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  transactionEmpty: {
    color: "transparent",
    fontSize: 15,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 16,
  },
  redBtn: {
    backgroundColor: "#F00000",
    marginRight: 6,
  },
  greenBtn: {
    backgroundColor: "#2ECC40",
    marginLeft: 6,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
