"use client";

import Link from "next/link";
import { ClipboardList, Users, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@teachy/db";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { getDashboardPathForRole } from "@/lib/utils/role";

export default function Home() {
  const { firebaseUser, dbUser } = useAuth();

  return (
    <div className="min-h-full bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center opacity-0 animate-fade-up">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Create engaging
            <span className="text-primary"> assessments</span>
            <br />
            for your students
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Build interactive quizzes, share them with a simple link, and track
            your students&apos; progress—all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-2">
            {firebaseUser && dbUser ? (
              <Button asChild size="lg">
                <Link href={getDashboardPathForRole(dbUser.role as UserRole)}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={ClipboardList}
            title="Create Lists"
            description="Build exercise lists with multiple-choice questions. Add as many questions and options as you need."
            colorClass="primary"
          />
          <FeatureCard
            icon={Users}
            title="Share Easily"
            description="Share a simple link with your students. They can take the quiz from any device, no login required."
            colorClass="accent"
            animationDelay="150ms"
          />
          <FeatureCard
            icon={CheckCircle}
            title="Track Results"
            description="View all student submissions in one place. See scores, averages, and individual responses."
            colorClass="success"
            animationDelay="300ms"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Quizly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
