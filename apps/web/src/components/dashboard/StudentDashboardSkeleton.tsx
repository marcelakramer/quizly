"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageContainer } from "@/components/layout";

export function StudentDashboardSkeleton() {
  return (
    <PageContainer>
      <div className="mb-6 space-y-2">
        <div className="h-8 w-full max-w-xs sm:max-w-sm bg-muted rounded animate-pulse" />
        <div className="h-5 w-full max-w-md sm:max-w-lg bg-muted rounded animate-pulse" />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
        <Card className="glass-card h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-32 sm:w-40 bg-muted rounded animate-pulse" />
                <div className="h-4 w-48 sm:w-56 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-5 h-full flex flex-col">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="relative">
                  <div className="h-10 w-full bg-muted rounded animate-pulse" />
                </div>
                <div className="h-3 w-36 sm:w-48 bg-muted rounded animate-pulse" />
              </div>
              <div className="mt-auto">
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-36 sm:w-44 bg-muted rounded animate-pulse" />
                <div className="h-4 w-48 sm:w-52 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="glass-card rounded-lg p-3 flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-6 w-12 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-28 sm:w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 sm:w-56 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg border border-border/50 p-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-0">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-40 sm:w-48 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-52 sm:w-64 bg-muted rounded animate-pulse" />
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="h-6 w-12 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-10 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
