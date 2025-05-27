import * as Contacts from "expo-contacts";

export interface ContactData {
  id: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
}

/**
 * Check if contacts permission is granted
 */
export const checkContactsPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Contacts.getPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error checking contacts permission:", error);
    return false;
  }
};

/**
 * Request contacts permission
 */
export const requestContactsPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting contacts permission:", error);
    return false;
  }
};

/**
 * Get all contacts from device
 */
export const getAllContacts = async (): Promise<ContactData[]> => {
  try {
    const hasPermission = await checkContactsPermission();
    if (!hasPermission) {
      throw new Error("Contacts permission not granted");
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
      ],
      sort: Contacts.SortTypes.FirstName,
    });

    return data.map((contact) => ({
      id: contact.id,
      name: contact.name || "Unknown",
      phoneNumbers:
        contact.phoneNumbers?.map((phone) => phone.number || "") || [],
      emails: contact.emails?.map((email) => email.email || "") || [],
    }));
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

/**
 * Search contacts by name or phone number
 */
export const searchContacts = async (query: string): Promise<ContactData[]> => {
  try {
    const allContacts = await getAllContacts();
    const lowercaseQuery = query.toLowerCase();

    return allContacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(lowercaseQuery) ||
        contact.phoneNumbers.some((phone) =>
          phone.replace(/\D/g, "").includes(query.replace(/\D/g, ""))
        )
    );
  } catch (error) {
    console.error("Error searching contacts:", error);
    throw error;
  }
};

/**
 * Get contacts with phone numbers only
 */
export const getContactsWithPhoneNumbers = async (): Promise<ContactData[]> => {
  try {
    const allContacts = await getAllContacts();
    return allContacts.filter((contact) => contact.phoneNumbers.length > 0);
  } catch (error) {
    console.error("Error fetching contacts with phone numbers:", error);
    throw error;
  }
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Handle different phone number lengths
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    // Pakistani format: 03XX-XXXXXXX
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  } else if (cleaned.length === 10) {
    // Standard format: (XXX) XXX-XXXX
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }

  // Return original if doesn't match expected formats
  return phoneNumber;
};

/**
 * Clean phone number for comparison/storage
 */
export const cleanPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, "");
};
