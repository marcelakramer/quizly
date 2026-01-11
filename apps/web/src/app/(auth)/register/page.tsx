"use client";

import { useState, FormEvent } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuthInstance } from "@teachy/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@teachy/db";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Logo } from "@/components/Logo";
import { UserPlus, Mail, Lock, User, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const auth = getAuthInstance();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const idToken = await userCredential.user.getIdToken();

      await api.auth.sync(idToken, role, name);

      toast.success("Account created successfully!");

      router.replace(
        role === UserRole.TEACHER ? "/teacher/dashboard" : "/student/dashboard"
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message.endsWith(".")
            ? err.message
            : `${err.message}.`
          : "Failed to create account.";
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
          <h1 className="text-3xl font-bold text-foreground">
            Create your account
          </h1>
          <p className="text-muted-foreground">
            Join Quizly and start creating assessments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />I am a
            </Label>
            <RadioGroup
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
              className="grid grid-cols-2 gap-4 items-stretch !space-y-0"
            >
              <div className="relative flex">
                <RadioGroupItem
                  value="STUDENT"
                  id="student"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="student"
                  className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-all h-[100px] w-full ${
                    role === UserRole.STUDENT
                      ? "border-primary bg-primary/5"
                      : "border-muted bg-background hover:bg-accent hover:text-white"
                  }`}
                >
                  <GraduationCap
                    className={`h-6 w-6 mb-2 ${
                      role === UserRole.STUDENT ? "text-primary" : ""
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      role === UserRole.STUDENT ? "text-primary" : ""
                    }`}
                  >
                    Student
                  </span>
                </Label>
              </div>
              <div className="relative flex">
                <RadioGroupItem
                  value="TEACHER"
                  id="teacher"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="teacher"
                  className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-all h-[100px] w-full ${
                    role === UserRole.TEACHER
                      ? "border-primary bg-primary/5"
                      : "border-muted bg-background hover:bg-accent hover:text-white"
                  }`}
                >
                  <User
                    className={`h-6 w-6 mb-2 ${
                      role === UserRole.TEACHER ? "text-primary" : ""
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      role === UserRole.TEACHER ? "text-primary" : ""
                    }`}
                  >
                    Teacher
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
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
            href="/login"
            className="text-primary hover:text-primary/80 font-medium transition-colors ml-1"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
