import { useMemo } from "react";
import { validateEmail } from "@/lib/utils/validation";

interface RegisterValidationResult {
  isValid: boolean;
  nameError: string | null;
  emailError: string | null;
  passwordError: string | null;
  confirmPasswordError: string | null;
}

export function useRegisterValidation(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): RegisterValidationResult {
  return useMemo(() => {
    const nameError = !name.trim() ? "Name is required" : null;
    const emailError = validateEmail(email);
    const passwordError = !password.trim()
      ? "Password is required"
      : password.length < 6
        ? "Password must be at least 6 characters"
        : null;
    const confirmPasswordError = !confirmPassword.trim()
      ? "Please confirm your password"
      : password !== confirmPassword
        ? "Passwords do not match"
        : null;

    return {
      isValid:
        !nameError && !emailError && !passwordError && !confirmPasswordError,
      nameError,
      emailError,
      passwordError,
      confirmPasswordError,
    };
  }, [name, email, password, confirmPassword]);
}
