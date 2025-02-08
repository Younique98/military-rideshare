import { FirebaseError } from "firebase/app";

const mapFirebaseError = ( errorCode: string | number ) => {
    console.log('errorCode', errorCode)
  const errorMap = {
    "auth/invalid-email": "The email address is not valid. Please check and try again.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "The password is incorrect. Please try again.",
    "auth/too-many-requests": "Too many login attempts. Please try again later.",
    "auth/email-already-in-use": "This email is already in use. Try a different one or reset your password.",
    "auth/weak-password": "The password is too weak. Please choose a stronger password.",
    "auth/operation-not-allowed": "This operation is not allowed. Please contact support.",
    "auth/invalid-credential": "The credentials are invalid or have expired. Try signing in with Google.",
  } as Record<string, string>; 

  return errorMap[errorCode] || "An error occurred. Please try again.";
};

export const handleAuthError = ( error: FirebaseError ) => {
    const errorCode = error.code; // E.g., "auth/invalid-email"
    const errorMessage = error.message; // E.g., "Firebase: Error (auth/invalid-email)."

    console.log(`Error Code: ${errorCode}`);
    console.log(`Error Message: ${errorMessage}`);

    // Map Firebase error codes to user-friendly messages
    const userFriendlyMessage = mapFirebaseError( errorCode );
    console.log(userFriendlyMessage);
    alert(userFriendlyMessage); // TODO: (ET) Replace with better UI handling (e.g., toast, modal)
};