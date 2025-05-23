import { FirebaseAuthTypes } from '@react-native-firebase/auth';

let confirmationResult: FirebaseAuthTypes.ConfirmationResult | null = null;

export const setConfirmationResult = (confirmation: FirebaseAuthTypes.ConfirmationResult) => {
  confirmationResult = confirmation;
};

export const getConfirmationResult = () => {
  return confirmationResult;
};

export const clearConfirmationResult = () => {
  confirmationResult = null;
}; 