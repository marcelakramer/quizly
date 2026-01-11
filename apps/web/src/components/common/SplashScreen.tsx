"use client";

import { Logo } from "./Logo";

export function SplashScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-6">
          <div className="animate-logo-pulse">
            <Logo width={80} height={80} className="text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Quizly</h2>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
