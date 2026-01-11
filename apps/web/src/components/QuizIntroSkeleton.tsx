"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function QuizIntroSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="glass-card hover-lift max-w-3xl w-full">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-8">
            <div className="h-24 w-24 rounded-2xl bg-muted animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-10 w-3/4 mx-auto bg-muted rounded animate-pulse" />
            <div className="h-6 w-1/2 mx-auto bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-4">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="glass-card rounded-lg p-6 text-center">
              <div className="h-16 w-16 rounded-xl bg-muted animate-pulse mx-auto mb-4" />
              <div className="h-8 w-12 mx-auto bg-muted rounded animate-pulse" />
              <div className="h-5 w-20 mx-auto bg-muted rounded animate-pulse mt-2" />
            </div>

            <div className="glass-card rounded-lg p-6 text-center">
              <div className="h-16 w-16 rounded-xl bg-muted animate-pulse mx-auto mb-4" />
              <div className="h-5 w-24 mx-auto bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 mx-auto bg-muted rounded animate-pulse mt-2" />
            </div>

            <div className="glass-card rounded-lg p-6 text-center">
              <div className="h-16 w-16 rounded-xl bg-muted animate-pulse mx-auto mb-4" />
              <div className="h-5 w-16 mx-auto bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 mx-auto bg-muted rounded animate-pulse mt-2" />
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-3">
            <div className="h-11 w-full bg-muted rounded animate-pulse" />
            <div className="h-11 w-full bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
