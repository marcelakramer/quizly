import { useMemo } from "react";
import { validateEmail } from "@/lib/utils/validation";

interface LoginValidationResult {
  isValid: boolean;
  emailError: string | null;
  passwordError: string | null;
}

export function useLoginValidation(
  email: string,
  password: string
): LoginValidationResult {
  return useMemo(() => {
    const emailError = validateEmail(email);
    const passwordError = !password.trim() ? "Password is required" : null;

    return {
      isValid: !emailError && !passwordError,
      emailError,
      passwordError,
    };
  }, [email, password]);
}
