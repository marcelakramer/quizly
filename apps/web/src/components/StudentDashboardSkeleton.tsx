"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageContainer } from "@/components/PageContainer";

export function StudentDashboardSkeleton() {
  return (
    <PageContainer>
      <div className="mb-8 space-y-2">
        <div className="h-9 w-64 bg-muted rounded animate-pulse" />
        <div className="h-5 w-96 bg-muted rounded animate-pulse" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card className="glass-card h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-40 bg-muted rounded animate-pulse" />
                <div className="h-4 w-56 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-6 h-full flex flex-col">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="relative">
                  <div className="h-10 w-full bg-muted rounded animate-pulse" />
                </div>
                <div className="h-3 w-48 bg-muted rounded animate-pulse" />
              </div>
              <div className="mt-auto">
                <div className="h-11 w-full bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-44 bg-muted rounded animate-pulse" />
                <div className="h-4 w-52 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
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
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-56 bg-muted rounded animate-pulse" />
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
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-64 bg-muted rounded animate-pulse" />
                    <div className="flex items-center gap-4">
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="text-right ml-4 space-y-1">
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
