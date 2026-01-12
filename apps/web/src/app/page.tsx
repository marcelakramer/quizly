"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ClipboardList, Users, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@teachy/db";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/common";
import { getDashboardPathForRole } from "@/lib/utils/role";

const HERO_TITLES = [
  "Create engaging assessments",
  "Build interactive and fun quizzes",
  "Track your students’ progress",
];

export default function Home() {
  const { firebaseUser, dbUser } = useAuth();

  const [_currentIndex, setCurrentIndex] = useState(0);
  const [displayedTitle, setDisplayedTitle] = useState(HERO_TITLES[0]);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % HERO_TITLES.length;
          setDisplayedTitle(HERO_TITLES[next]);
          return next;
        });
        setFade(true);
      }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const renderTitle = (text: string) => {
    const words = text.split(" ");
    return words.map((word, i) => (
      <span
        key={i}
        className={i % 2 !== 0 ? "text-primary" : "text-foreground"}
      >
        {word}{" "}
      </span>
    ));
  };

  return (
    <div className="min-h-full bg-background scroll-smooth">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center relative">
          {/* Hero Title */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight transition-all duration-700 ease-in-out transform opacity-0 ${
              fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
            }`}
            style={{ minHeight: "5rem" }} // fix height for 2 lines
          >
            {renderTitle(displayedTitle)}
          </h1>

          <p className="mt-6 text-lg text-muted-foreground md:text-xl opacity-0 animate-fade-up animate-delay-200">
            Build interactive quizzes, share them with a simple link, and track
            your students&apos; progress—all in one place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-2 opacity-0 animate-fade-up animate-delay-300">
            {firebaseUser && dbUser ? (
              <Button
                asChild
                size="lg"
                className="transition-transform hover:scale-105 hover:shadow-lg"
              >
                <Link href={getDashboardPathForRole(dbUser.role as UserRole)}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="transition-transform hover:scale-105 hover:shadow-lg"
              >
                <Link href="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
            className="transition-transform hover:scale-105 hover:shadow-2xl animate-fade-up animate-delay-100"
          />
          <FeatureCard
            icon={Users}
            title="Share Easily"
            description="Share a simple link with your students. They can take the quiz from any device, no login required."
            colorClass="accent"
            className="transition-transform hover:scale-105 hover:shadow-2xl animate-fade-up animate-delay-200"
          />
          <FeatureCard
            icon={CheckCircle}
            title="Track Results"
            description="View all student submissions in one place. See scores, averages, and individual responses."
            colorClass="success"
            className="transition-transform hover:scale-105 hover:shadow-2xl animate-fade-up animate-delay-300"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground opacity-0 animate-fade-up animate-delay-400">
          <p>&copy; {new Date().getFullYear()} Quizly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
