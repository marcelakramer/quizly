"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ClipboardList, ArrowRight, Key } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function StudentDashboard() {
  const router = useRouter();
  const [shareCode, setShareCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!shareCode.trim()) {
      toast.error("Please enter a quiz code");
      return;
    }

    setLoading(true);

    try {
      // Validate the share code by trying to fetch the quiz
      await api.quiz.getByShareCode(shareCode.trim().toUpperCase());

      // If successful, redirect to the quiz
      router.push(`/quiz/${shareCode.trim().toUpperCase()}`);
    } catch (error) {
      console.error("Error validating quiz code:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Invalid quiz code. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center opacity-0 animate-fade-up">
            <h1 className="text-3xl font-bold text-foreground">
              Student Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enter the quiz code provided by your teacher
            </p>
          </div>

          <Card className="glass-card hover-lift opacity-0 animate-scale-in">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg">
                  <ClipboardList className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Enter Quiz Code</CardTitle>
              <CardDescription className="mt-2">
                Get the code from your teacher to start the quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="shareCode">Quiz Code</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="shareCode"
                      type="text"
                      placeholder="Enter quiz code (e.g., ABC123)"
                      value={shareCode}
                      onChange={(e) =>
                        setShareCode(e.target.value.toUpperCase())
                      }
                      className="pl-10 text-lg font-mono tracking-wider"
                      maxLength={6}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The code is usually 6 characters long
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading || !shareCode.trim()}
                >
                  {loading ? (
                    "Validating..."
                  ) : (
                    <>
                      Start Quiz
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
