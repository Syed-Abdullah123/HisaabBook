import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ContactHeader from "../components/ContactHeader";

const ContactDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Dummy contact data (in real app, get from params or state)
  const contact = route.params?.contact || {
    name: "Junaid",
    number: "03012451021",
    balance: 0,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ContactHeader
        name={contact.name}
        number={contact.number}
        onBackPress={() => navigation.goBack()}
        onMenuPress={() => {}}
      />

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Hisaab clear hai</Text>
        <Text style={styles.balanceAmount}>Rs.0</Text>
      </View>

      <View style={styles.illustrationContainer}>
        {/* Replace with your own illustration if available */}
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

export default ContactDetailsScreen;

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: "#F5F6FA",
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: 18,
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 18,
  },
  balanceLabel: {
    fontSize: 15,
    color: "#888",
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  illustrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  illustration: {
    width: 120,
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
