import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  PermissionsAndroid,
} from "react-native";
import * as Contacts from "expo-contacts";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const PAGE_SIZE = 50; // Load 50 contacts at a time

const AddContact = () => {
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [offset, setOffset] = useState(0);

  const navigation = useNavigation();

  // Request permissions and load first page
  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        loadContacts(); // Load first batch
      } else {
        console.warn("Permission denied for contacts.");
      }
    })();
  }, []);

  const loadContacts = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data, hasNextPage } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
        pageSize: PAGE_SIZE,
        pageOffset: offset,
      });

      // Filter out contacts with no phone number
      const filtered = data.filter((c) => c.phoneNumbers?.length > 0);

      setContacts((prev) => [...prev, ...filtered]);
      setHasNextPage(hasNextPage);
      setOffset((prev) => prev + PAGE_SIZE);
    } catch (err) {
      console.error("Error loading contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const name = c.name?.toLowerCase() || "";
    const number = c.phoneNumbers?.[0]?.number || "";
    return name.includes(search.toLowerCase()) || number.includes(search);
  });

  const renderContact = ({ item }: { item: any }) => {
    const number = item.phoneNumbers?.[0]?.number || "No Number";
    return (
      <View style={styles.contactRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.[0] || "?"}</Text>
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactNumber}>{number}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            navigation.navigate("ContactDetails", {
              contact: {
                name: item.name,
                number,
              },
            })
          }
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Contact Add Karain</Text>
        </View>
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Naam/Number se search karain"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#B0B0B0"
          />
        </View>
        <Text style={styles.sectionTitle}>Phone Contacts</Text>
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage) {
              loadContacts();
            }
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loading ? <ActivityIndicator size="small" /> : null
          }
        />
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={() => navigation.navigate("AddNewContact")}
        >
          <Ionicons name="person-add-outline" size={24} color="white" />
          <Text style={styles.bottomBtnText}>Naya Contact Banain</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddContact;

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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
    textAlign: "center",
    // marginRight: 32, // To balance the back button
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    height: 44,
    fontSize: 15,
    color: "#222",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
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
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  contactNumber: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: "#2F51FF",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  bottomBtn: {
    flexDirection: "row",
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 28,
    backgroundColor: "#2F51FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  bottomBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
});
