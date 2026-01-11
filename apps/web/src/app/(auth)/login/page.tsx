"use client";

import { useState, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuthInstance } from "@teachy/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getDashboardPathForRole } from "@/lib/utils/role";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Logo } from "@/components/Logo";
import { LogIn, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useLoginValidation } from "@/hooks/use-login-validation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const router = useRouter();
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
      const auth = getAuthInstance();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const idToken = await userCredential.user.getIdToken();

      const { user: dbUser } = await api.auth.me(idToken);

      toast.success("Welcome back!");

      router.push(getDashboardPathForRole(dbUser.role));
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message.endsWith(".")
            ? err.message
            : `${err.message}.`
          : "Failed to sign in.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 opacity-0 animate-fade-up">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Logo width={80} height={80} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your Quizly account
          </p>
        </div>

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

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Don&apos;t have an account?{" "}
          </span>
          <Link
            href="/register"
            className="text-primary hover:text-primary/80 font-medium transition-colors ml-1"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
