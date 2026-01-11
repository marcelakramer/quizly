/**
 * Firebase auth error codes mapped to user-friendly messages
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Login errors
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled":
    "This account has been disabled. Please contact support.",
  "auth/user-not-found":
    "No account found with this email. Please register first.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/too-many-requests": "Too many failed attempts. Please try again later.",

  // Registration errors
  "auth/email-already-in-use":
    "An account with this email already exists. Please sign in instead.",
  "auth/weak-password":
    "Password is too weak. Please use at least 6 characters.",
  "auth/operation-not-allowed":
    "Registration is currently disabled. Please try again later.",

  // Network errors
  "auth/network-request-failed":
    "Network error. Please check your connection and try again.",

  // General errors
  "auth/internal-error": "Something went wrong. Please try again later.",
  "auth/invalid-api-key": "Configuration error. Please contact support.",
};

/**
 * Get a user-friendly error message from a Firebase auth error
 * @param error - The error object from Firebase auth
 * @param fallbackMessage - Default message if error code is not recognized
 * @returns User-friendly error message
 */
export function getAuthErrorMessage(
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred. Please try again."
): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    return AUTH_ERROR_MESSAGES[code] || fallbackMessage;
  }

  return fallbackMessage;
}
