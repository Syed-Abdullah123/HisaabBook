import React, { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthProvider";
import SettingListItem from "../components/SettingListItem";
import CustomProfileModal from "../components/CustomProfileModal";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  // State for modals
  const [editNameModal, setEditNameModal] = useState(false);
  const [editBusinessModal, setEditBusinessModal] = useState(false);
  const [editTypeModal, setEditTypeModal] = useState(false);
  const [editCurrencyModal, setEditCurrencyModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);

  // State for fields
  const [name, setName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [businessName, setBusinessName] = useState("NFT"); // TODO: fetch from user profile
  const [businessType, setBusinessType] = useState("General");
  const [currency, setCurrency] = useState("RS");

  // For type selection
  const businessTypes = [
    "Aluminum / Steel / Glass",
    "Apparels / Garments",
    "Automobile Shop",
    "Bakery / Cafe / Kiryana Store",
    "Medical Store",
    "Electronics",
    "Gold & Jewelry",
    "Other",
  ];

  // For currency selection
  const currencyOptions = ["RS", "USD", "INR", "SAR"];

  // Handlers
  const handleSaveName = () => {
    // TODO: Save name to user profile (Firebase or Firestore)
    setEditNameModal(false);
    Alert.alert("Success", "Name updated successfully!");
  };
  const handleSaveBusiness = () => {
    // TODO: Save business name
    setEditBusinessModal(false);
    Alert.alert("Success", "Business name updated!");
  };
  const handleSaveType = () => {
    // TODO: Save business type
    setEditTypeModal(false);
    Alert.alert("Success", "Business type updated!");
  };
  const handleSaveCurrency = () => {
    // TODO: Save currency
    setEditCurrencyModal(false);
    Alert.alert("Success", "Currency updated!");
  };
  const handleDeleteAccount = () => {
    // TODO: Delete account logic
    setDeleteAccountModal(false);
    Alert.alert("Account Deleted", "Your account has been deleted.");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={48} color="#2563eb" />
          </View>
          <Text style={styles.name}>{name || "User Name"}</Text>
          <Text style={styles.phone}>{phone || "03XXXXXXXXX"}</Text>
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          <SettingListItem
            icon={
              <MaterialIcons name="business-center" size={22} color="#2563eb" />
            }
            title="Karobar Ki Maloomat"
            subtitle="Business Details"
            onPress={() => setEditBusinessModal(true)}
          />
          <SettingListItem
            icon={<FontAwesome5 name="store" size={20} color="#2563eb" />}
            title="Karobar Ka Name"
            subtitle={businessName}
            onPress={() => setEditBusinessModal(true)}
          />
          <SettingListItem
            icon={
              <Ionicons name="list-circle-outline" size={22} color="#2563eb" />
            }
            title="Karobar Type"
            subtitle={businessType}
            onPress={() => setEditTypeModal(true)}
          />
          <SettingListItem
            icon={
              <Ionicons name="language-outline" size={22} color="#2563eb" />
            }
            title="App Ki Zaban"
            subtitle="Urdu"
            onPress={() =>
              Alert.alert("Coming Soon", "Language change coming soon!")
            }
          />
          <SettingListItem
            icon={<Ionicons name="cash-outline" size={22} color="#2563eb" />}
            title="Currency Type"
            subtitle={currency}
            onPress={() => setEditCurrencyModal(true)}
          />
          <SettingListItem
            icon={<Ionicons name="trash-outline" size={22} color="#f59e42" />}
            title="Deleted Items"
            subtitle="Recover deleted customers"
            onPress={() =>
              Alert.alert("Coming Soon", "Deleted items coming soon!")
            }
          />
          <SettingListItem
            icon={
              <Ionicons name="close-circle-outline" size={22} color="#f00" />
            }
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={() => setDeleteAccountModal(true)}
            showChevron={false}
          />
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <CustomProfileModal
        visible={editNameModal}
        onClose={() => setEditNameModal(false)}
        title="Edit Name"
        actions={[
          {
            label: "Cancel",
            onPress: () => setEditNameModal(false),
            type: "secondary",
          },
          { label: "Save", onPress: handleSaveName, type: "primary" },
        ]}
      >
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />
      </CustomProfileModal>

      {/* Edit Business Name Modal */}
      <CustomProfileModal
        visible={editBusinessModal}
        onClose={() => setEditBusinessModal(false)}
        title="Edit Business Name"
        actions={[
          {
            label: "Cancel",
            onPress: () => setEditBusinessModal(false),
            type: "secondary",
          },
          { label: "Save", onPress: handleSaveBusiness, type: "primary" },
        ]}
      >
        <TextInput
          style={styles.input}
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="Business Name"
        />
      </CustomProfileModal>

      {/* Edit Business Type Modal */}
      <CustomProfileModal
        visible={editTypeModal}
        onClose={() => setEditTypeModal(false)}
        title="Select Business Type"
        actions={[
          {
            label: "Cancel",
            onPress: () => setEditTypeModal(false),
            type: "secondary",
          },
          { label: "Save", onPress: handleSaveType, type: "primary" },
        ]}
      >
        {businessTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeOption,
              businessType === type && styles.typeOptionSelected,
            ]}
            onPress={() => setBusinessType(type)}
          >
            <Text
              style={{
                color: businessType === type ? "#2563eb" : "#222",
                fontWeight: businessType === type ? "bold" : "normal",
              }}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </CustomProfileModal>

      {/* Edit Currency Modal */}
      <CustomProfileModal
        visible={editCurrencyModal}
        onClose={() => setEditCurrencyModal(false)}
        title="Change Currency"
        actions={[
          {
            label: "Cancel",
            onPress: () => setEditCurrencyModal(false),
            type: "secondary",
          },
          { label: "Save", onPress: handleSaveCurrency, type: "primary" },
        ]}
      >
        {currencyOptions.map((cur) => (
          <TouchableOpacity
            key={cur}
            style={[
              styles.typeOption,
              currency === cur && styles.typeOptionSelected,
            ]}
            onPress={() => setCurrency(cur)}
          >
            <Text
              style={{
                color: currency === cur ? "#2563eb" : "#222",
                fontWeight: currency === cur ? "bold" : "normal",
              }}
            >
              {cur}
            </Text>
          </TouchableOpacity>
        ))}
      </CustomProfileModal>

      {/* Delete Account Modal */}
      <CustomProfileModal
        visible={deleteAccountModal}
        onClose={() => setDeleteAccountModal(false)}
        title="Delete Account?"
        actions={[
          {
            label: "Cancel",
            onPress: () => setDeleteAccountModal(false),
            type: "secondary",
          },
          { label: "Delete", onPress: handleDeleteAccount, type: "primary" },
        ]}
      >
        <Text style={{ color: "#f00", textAlign: "center", marginBottom: 8 }}>
          Are you sure you want to delete your account? This action cannot be
          undone.
        </Text>
      </CustomProfileModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    paddingTop: 38,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 28,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E8EDFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  phone: {
    fontSize: 15,
    color: "#888",
    marginBottom: 2,
  },
  settingsList: {
    marginTop: 8,
  },
  input: {
    backgroundColor: "#F5F6FA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
    color: "#222",
    marginBottom: 10,
  },
  typeOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#F5F6FA",
  },
  typeOptionSelected: {
    backgroundColor: "#E8EDFB",
    borderColor: "#2563eb",
    borderWidth: 1,
  },
});

export default ProfileScreen;
