import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Linking,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

interface ContactHeaderProps {
  name: string;
  number: string;
  onBackPress?: () => void;
  onMenuPress?: () => void;
}

const ContactHeader: React.FC<ContactHeaderProps> = ({
  name,
  number,
  onBackPress,
  onMenuPress,
}) => {
  const [showCallModal, setShowCallModal] = useState(false);

  const handleSimCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsAppCall = (phoneNumber: string) => {
    // WhatsApp expects international format, e.g., +923001234567
    const formatted = phoneNumber.replace(/^0/, "+92");
    const url = `https://wa.me/${formatted}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert("Error", "WhatsApp is not installed");
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => Alert.alert("Error", "Failed to open WhatsApp"));
  };

  return (
    <>
      <View style={styles.headerRow}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#222" />
          </TouchableOpacity>
        )}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.contactName}>{name}</Text>
          <Text style={styles.contactNumber}>{number}</Text>
        </View>
        <TouchableOpacity
          style={{ marginHorizontal: 8 }}
          onPress={() => setShowCallModal(true)}
        >
          <Feather name="phone" size={20} color="#222" />
        </TouchableOpacity>
        {onMenuPress && (
          <TouchableOpacity onPress={onMenuPress}>
            <Feather name="more-vertical" size={20} color="#222" />
          </TouchableOpacity>
        )}
      </View>
      <Modal
        visible={showCallModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCallModal(false)}
        statusBarTranslucent={true} // Fix for the white header issue
      >
        <View style={styles.modalContainer}>
          {/* This TouchableWithoutFeedback handles the overlay taps */}
          <TouchableWithoutFeedback onPress={() => setShowCallModal(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          {/* Bottom sheet is now outside the overlay's press handler */}
          <View style={styles.bottomSheetModal}>
            <View style={styles.dragIndicatorModal} />
            <View style={styles.callIconCircle}>
              <Ionicons name="call" size={32} color="#2F51FF" />
            </View>
            <Text style={styles.callTitle}>Customer ko call karien</Text>
            <View style={styles.callBtnRow}>
              <TouchableOpacity
                style={styles.simBtn}
                activeOpacity={0.8}
                onPress={() => handleSimCall(number)}
              >
                <Ionicons
                  name="call"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.simBtnText}>SIM Pey</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.whatsappBtn}
                activeOpacity={0.8}
                onPress={() => handleWhatsAppCall(number)}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.whatsappBtnText}>WhatsApp Pey</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ContactHeader;

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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
    zIndex: 1,
  },
  bottomSheetModal: {
    position: "relative", // Changed from absolute
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 2, // Higher than overlay
  },
  dragIndicatorModal: {
    width: 56,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 18,
  },
  callIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  callTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 24,
  },
  callBtnRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 12,
  },
  simBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2F51FF",
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: "center",
    marginRight: 6,
  },
  simBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: "center",
    marginLeft: 6,
  },
  whatsappBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
