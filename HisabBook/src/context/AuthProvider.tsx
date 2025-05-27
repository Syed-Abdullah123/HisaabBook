import React, { createContext, useEffect, useState, ReactNode } from "react";
import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  user: any;
  isOnboardingComplete: boolean;
  completeOnboarding: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isOnboardingComplete: false,
  completeOnboarding: async () => {},
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
          const onboardingStatus = await AsyncStorage.getItem(
            `onboarding_${usr.uid}`
          );
          setIsOnboardingComplete(onboardingStatus === "complete");
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

  if (initializing) return null; // Or return a Splash Screen

  return (
    <AuthContext.Provider
      value={{ user, isOnboardingComplete, completeOnboarding }}
    >
      {children}
    </AuthContext.Provider>
  );
};
