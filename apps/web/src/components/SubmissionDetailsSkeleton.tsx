"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SubmissionDetailsSkeletonProps {
  showResultCard?: boolean;
}

export function SubmissionDetailsSkeleton({
  showResultCard = false,
}: SubmissionDetailsSkeletonProps = {}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <div className="mb-6 h-6 w-32 bg-muted rounded animate-pulse" />

        <div className="mb-8 space-y-2">
          <div className="h-9 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-5 w-1/2 bg-muted rounded animate-pulse" />
        </div>

        {showResultCard && (
          <Card className="glass-card mb-8">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="h-16 w-16 mx-auto mb-3 bg-muted rounded animate-pulse" />
              <div className="h-7 w-48 mx-auto mb-2 bg-muted rounded animate-pulse" />
              <div className="h-5 w-64 mx-auto bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card">
          <CardHeader>
            <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg p-4 border-2 bg-muted/10 border-muted/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-muted animate-pulse flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        <div className="h-3 w-28 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
