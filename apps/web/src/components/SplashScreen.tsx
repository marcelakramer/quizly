"use client";

import { BookOpen } from "lucide-react";

export function SplashScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-lg animate-scale-in relative overflow-hidden">
            <BookOpen className="h-12 w-12 text-primary-foreground animate-book-pages" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Teachy</h2>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
