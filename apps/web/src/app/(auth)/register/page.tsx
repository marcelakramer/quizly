"use client";

import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@teachy/db";
import { getAuthErrorMessage } from "@/lib/utils/auth";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { RoleCard } from "@/components/RoleCard";
import { Logo } from "@/components/Logo";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  GraduationCap,
  UserPen,
} from "lucide-react";
import { toast } from "sonner";
import { useRegisterValidation } from "@/hooks/use-register-validation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { register } = useAuth();
  const {
    isValid,
    nameError,
    emailError,
    passwordError,
    confirmPasswordError,
  } = useRegisterValidation(name, email, password, confirmPassword);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      if (nameError) {
        toast.error(nameError);
      } else if (emailError) {
        toast.error(emailError);
      } else if (passwordError) {
        toast.error(passwordError);
      } else if (confirmPasswordError) {
        toast.error(confirmPasswordError);
      }
      return;
    }

    setLoading(true);

    try {
      await register(email, password, role, name);
      toast.success("Account created successfully!");
    } catch (err) {
      toast.error(
        getAuthErrorMessage(err, "Failed to create account. Please try again.")
      );
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
          <h1 className="text-3xl font-bold text-foreground">
            Create your account
          </h1>
          <p className="text-muted-foreground">
            Join Quizly and start creating assessments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Full Name"
            labelIcon={User}
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              setName((s) => s.trim());
              setTouched((prev) => ({ ...prev, name: true }));
            }}
            maxLength={100}
            disabled={loading}
            error={nameError}
            touched={touched.name}
          />

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
            maxLength={255}
            disabled={loading}
            error={emailError}
            touched={touched.email}
          />

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <UserPen className="h-4 w-4" />I am a
            </Label>
            <RadioGroup
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
              className="grid grid-cols-2 gap-4 items-stretch !space-y-0"
            >
              <RoleCard
                id="student"
                value="STUDENT"
                selected={role === UserRole.STUDENT}
                Icon={GraduationCap}
              >
                Student
              </RoleCard>

              <RoleCard
                id="teacher"
                value="TEACHER"
                selected={role === UserRole.TEACHER}
                Icon={User}
              >
                Teacher
              </RoleCard>
            </RadioGroup>
          </div>

          <FormField
            label="Password"
            labelIcon={Lock}
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Minimum 6 characters"
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

          <FormField
            label="Confirm Password"
            labelIcon={Lock}
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => {
              setConfirmPassword((s) => s.trim());
              setTouched((prev) => ({ ...prev, confirmPassword: true }));
            }}
            maxLength={128}
            disabled={loading}
            error={confirmPasswordError}
            touched={touched.confirmPassword}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || !isValid}
          >
            {loading ? (
              "Creating account..."
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Already have an account?{" "}
          </span>
          <Link
            href={
              redirectTo
                ? `/login?redirect=${encodeURIComponent(redirectTo)}`
                : "/login"
            }
            className="text-primary hover:text-primary/80 font-medium transition-colors ml-1"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
