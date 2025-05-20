import { Ionicons, EvilIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Pressable,
} from "react-native";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>NFT</Text>
          <Ionicons name="chevron-down" size={18} color="black" />
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
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#fff",
    paddingTop: 20,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 8,
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
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    borderRadius: 16,
    marginHorizontal: 6,
    alignItems: "center",
    paddingVertical: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
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
});
