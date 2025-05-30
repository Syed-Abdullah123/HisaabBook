import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Action {
  label: string;
  onPress: () => void;
  type?: "primary" | "secondary";
}

interface CustomProfileModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: Action[];
}

const CustomProfileModal: React.FC<CustomProfileModalProps> = ({
  visible,
  onClose,
  title,
  children,
  actions,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.content}>{children}</View>
          {actions && (
            <View style={styles.actions}>
              {actions.map((action, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.button,
                    action.type === "primary"
                      ? styles.primary
                      : styles.secondary,
                  ]}
                  onPress={action.onPress}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      action.type === "primary"
                        ? styles.primaryText
                        : styles.secondaryText,
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#222",
    textAlign: "center",
  },
  content: {
    marginBottom: 18,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  primary: {
    backgroundColor: "#2563eb",
  },
  secondary: {
    backgroundColor: "#f3f4f6",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#222",
  },
});

export default CustomProfileModal;
