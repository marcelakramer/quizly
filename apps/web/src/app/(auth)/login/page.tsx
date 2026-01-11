"use client";

import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { getAuthErrorMessage } from "@/lib/utils/auth";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  AuthPageLayout,
  AuthHeader,
  AuthFooterLink,
} from "@/components/auth/AuthPageLayout";
import { LogIn, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useLoginValidation } from "@/hooks/use-login-validation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { signIn } = useAuth();
  const { isValid, emailError, passwordError } = useLoginValidation(
    email,
    password
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      if (emailError) {
        toast.error(emailError);
      } else if (passwordError) {
        toast.error(passwordError);
      }
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(
        getAuthErrorMessage(err, "Failed to sign in. Please try again.")
      );
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <AuthHeader
        title="Welcome back"
        description="Sign in to your Quizly account"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email address"
          labelIcon={Mail}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => {
            setEmail((s) => s.trim());
            setTouched((prev) => ({ ...prev, email: true }));
          }}
          maxLength={254}
          disabled={loading}
          error={emailError}
          touched={touched.email}
        />

        <FormField
          label="Password"
          labelIcon={Lock}
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => {
            setPassword((s) => s.trim());
            setTouched((prev) => ({ ...prev, password: true }));
          }}
          maxLength={128}
          disabled={loading}
          error={passwordError}
          touched={touched.password}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || !isValid}
        >
          {loading ? (
            "Signing in..."
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </>
          )}
        </Button>
      </form>

      <AuthFooterLink
        text="Don't have an account?"
        linkText="Register here"
        href={
          redirectTo
            ? `/register?redirect=${encodeURIComponent(redirectTo)}`
            : "/register"
        }
      />
    </AuthPageLayout>
  );
}
