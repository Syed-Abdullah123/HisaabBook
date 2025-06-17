import React, { useContext, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthProvider";
import SettingListItem from "../components/SettingListItem";
import CustomProfileModal from "../components/CustomProfileModal";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { auth, firestore } from "../../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from "@react-native-firebase/firestore";
import {
  PhoneAuthProvider,
  signInWithCredential,
} from "@react-native-firebase/auth";

interface UserData {
  username: string;
  phoneNumber: string;
  businessName: string;
  businessType: string;
  currency: string;
  contacts?: { [key: string]: any };
  transactions?: { [key: string]: any };
}

type ProfileScreenNavigationProp = NativeStackNavigationProp<any>;

const ProfileScreen = () => {
  const { user, signOut } = useContext(AuthContext);
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // State for modals
  const [editNameModal, setEditNameModal] = useState(false);
  const [editBusinessModal, setEditBusinessModal] = useState(false);
  const [editTypeModal, setEditTypeModal] = useState(false);
  const [editCurrencyModal, setEditCurrencyModal] = useState(false);
  const [signoutModal, setSignoutModal] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");

  // State for fields
  const [userData, setUserData] = useState<UserData>({
    username: "",
    phoneNumber: "",
    businessName: "",
    businessType: "",
    currency: "RS",
  });

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

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData({
          username: data?.username || "",
          phoneNumber: data?.phoneNumber || "",
          businessName: data?.businessName || "",
          businessType: data?.businessType || "",
          currency: data?.currency || "RS",
          contacts: data?.contacts,
          transactions: data?.transactions,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (field: keyof UserData, value: string) => {
    if (!user) return;
    setUpdating(true);
    try {
      await updateDoc(doc(firestore, "users", user.uid), {
        [field]: value,
      });
      setUserData((prev) => ({ ...prev, [field]: value }));
      return true;
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      Alert.alert("Error", `Failed to update ${field}`);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Handlers
  const handleSaveName = async () => {
    const success = await updateUserData("username", userData.username);
    if (success) {
      setEditNameModal(false);
      Alert.alert("Success", "Name updated successfully!");
    }
  };

  const handleSaveBusiness = async () => {
    const success = await updateUserData("businessName", userData.businessName);
    if (success) {
      setEditBusinessModal(false);
      Alert.alert("Success", "Business name updated!");
    }
  };

  const handleSaveType = async () => {
    const success = await updateUserData("businessType", userData.businessType);
    if (success) {
      setEditTypeModal(false);
      Alert.alert("Success", "Business type updated!");
    }
  };

  const handleSaveCurrency = async () => {
    const success = await updateUserData("currency", userData.currency);
    if (success) {
      setEditCurrencyModal(false);
      Alert.alert("Success", "Currency updated!");
    }
  };

  const handleSignout = async () => {
    try {
      await signOut();
      // No need to navigate manually - the MainNavigator will handle this
      // based on the user state change
    } catch (error: any) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    } finally {
      setSignoutModal(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.avatarCircle}>
            {/* <Ionicons name="person" size={48} color="#2563eb" /> */}
            <Text style={styles.avatarText}>
              {userData.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{userData.username || "User Name"}</Text>
          <Text style={styles.phone}>
            {userData.phoneNumber || "03XXXXXXXXX"}
          </Text>
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
            subtitle={userData.businessName}
            onPress={() => setEditBusinessModal(true)}
          />
          <SettingListItem
            icon={
              <Ionicons name="list-circle-outline" size={22} color="#2563eb" />
            }
            title="Karobar Type"
            subtitle={userData.businessType}
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
            subtitle={userData.currency}
            onPress={() => setEditCurrencyModal(true)}
          />
          <SettingListItem
            icon={<Ionicons name="trash-outline" size={22} color="#f59e42" />}
            title="Deleted Items"
            subtitle="Recover deleted customers"
            onPress={() => navigation.navigate("DeletedItems")}
          />
          <SettingListItem
            icon={<Ionicons name="log-out-outline" size={22} color="#f00" />}
            title="Sign Out"
            subtitle="Sign out from your account"
            onPress={() => setSignoutModal(true)}
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
          {
            label: updating ? "Saving..." : "Save",
            onPress: handleSaveName,
            type: "primary",
          },
        ]}
      >
        <TextInput
          style={styles.input}
          value={userData.username}
          onChangeText={(text) =>
            setUserData((prev) => ({ ...prev, username: text }))
          }
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
          {
            label: updating ? "Saving..." : "Save",
            onPress: handleSaveBusiness,
            type: "primary",
          },
        ]}
      >
        <TextInput
          style={styles.input}
          value={userData.businessName}
          onChangeText={(text) =>
            setUserData((prev) => ({ ...prev, businessName: text }))
          }
          placeholder="Enter business name"
        />
      </CustomProfileModal>

      {/* Edit Business Type Modal */}
      <CustomProfileModal
        visible={editTypeModal}
        onClose={() => setEditTypeModal(false)}
        title="Edit Business Type"
        actions={[
          {
            label: "Cancel",
            onPress: () => setEditTypeModal(false),
            type: "secondary",
          },
          {
            label: updating ? "Saving..." : "Save",
            onPress: handleSaveType,
            type: "primary",
          },
        ]}
      >
        <ScrollView style={styles.typeList}>
          {businessTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeItem,
                userData.businessType === type && styles.typeItemSelected,
              ]}
              onPress={() =>
                setUserData((prev) => ({ ...prev, businessType: type }))
              }
            >
              <Text
                style={[
                  styles.typeItemText,
                  userData.businessType === type && styles.typeItemTextSelected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </CustomProfileModal>

      {/* Edit Currency Modal */}
      <CustomProfileModal
        visible={editCurrencyModal}
        onClose={() => setEditCurrencyModal(false)}
        title="Edit Currency"
        actions={[
          {
            label: "Cancel",
            onPress: () => setEditCurrencyModal(false),
            type: "secondary",
          },
          {
            label: updating ? "Saving..." : "Save",
            onPress: handleSaveCurrency,
            type: "primary",
          },
        ]}
      >
        <ScrollView style={styles.typeList}>
          {currencyOptions.map((currency) => (
            <TouchableOpacity
              key={currency}
              style={[
                styles.typeItem,
                userData.currency === currency && styles.typeItemSelected,
              ]}
              onPress={() => setUserData((prev) => ({ ...prev, currency }))}
            >
              <Text
                style={[
                  styles.typeItemText,
                  userData.currency === currency && styles.typeItemTextSelected,
                ]}
              >
                {currency}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </CustomProfileModal>

      {/* Sign Out Modal */}
      <CustomProfileModal
        visible={signoutModal}
        onClose={() => setSignoutModal(false)}
        title="Sign Out"
        actions={[
          {
            label: "Cancel",
            onPress: () => setSignoutModal(false),
            type: "secondary",
          },
          {
            label: "Sign Out",
            onPress: handleSignout,
            type: "primary",
          },
        ]}
      >
        <Text style={styles.deleteWarning}>
          Are you sure you want to sign out? You'll need to sign in again to
          access your account.
        </Text>
      </CustomProfileModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 38,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
  },
  headerCard: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563eb",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: "#666",
  },
  settingsList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 3.84,
    // elevation: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  typeList: {
    maxHeight: 300,
  },
  typeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  typeItemSelected: {
    backgroundColor: "#EFF6FF",
  },
  typeItemText: {
    fontSize: 16,
    color: "#333",
  },
  typeItemTextSelected: {
    color: "#2563eb",
    fontWeight: "600",
  },
  deleteWarning: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  verificationInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    fontSize: 16,
  },
});

export default ProfileScreen;
