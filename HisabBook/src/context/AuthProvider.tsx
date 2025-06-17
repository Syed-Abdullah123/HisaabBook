import React, { createContext, useEffect, useState, ReactNode } from "react";
import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";

type AuthContextType = {
  user: any;
  isOnboardingComplete: boolean;
  completeOnboarding: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isOnboardingComplete: false,
  completeOnboarding: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (usr) => {
      setUser(usr);

      if (usr) {
        // Check if onboarding is complete for this user
        try {
          const userDoc = await firestore()
            .collection("users")
            .doc(usr.uid)
            .get();
          const userData = userDoc.data();

          // Check if business name is set
          const hasBusinessName =
            userData?.businessName && userData.businessName.trim() !== "";

          // Set onboarding status based on business name
          setIsOnboardingComplete(hasBusinessName);

          // Update AsyncStorage to match
          await AsyncStorage.setItem(
            `onboarding_${usr.uid}`,
            hasBusinessName ? "complete" : "incomplete"
          );
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          setIsOnboardingComplete(false);
        }
      } else {
        setIsOnboardingComplete(false);
      }

      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  const completeOnboarding = async () => {
    if (user) {
      try {
        await AsyncStorage.setItem(`onboarding_${user.uid}`, "complete");
        setIsOnboardingComplete(true);
      } catch (error) {
        console.error("Error saving onboarding status:", error);
      }
    }
  };

  const signOut = async () => {
    try {
      // Set sign-out flag before signing out
      await AsyncStorage.setItem("isSignOut", "true");

      await auth().signOut();
      // Clear any stored onboarding status
      if (user) {
        await AsyncStorage.removeItem(`onboarding_${user.uid}`);
      }
      setUser(null);
      setIsOnboardingComplete(false);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  if (initializing) return null;

  return (
    <AuthContext.Provider
      value={{ user, isOnboardingComplete, completeOnboarding, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
