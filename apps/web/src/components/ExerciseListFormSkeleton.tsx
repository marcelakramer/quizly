"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageContainer } from "@/components/PageContainer";

interface ExerciseListFormSkeletonProps {
  showDeleteButton?: boolean;
}

export function ExerciseListFormSkeleton({
  showDeleteButton = false,
}: ExerciseListFormSkeletonProps = {}) {
  return (
    <PageContainer>
      <div className="mb-6 h-10 w-40 bg-muted rounded animate-pulse" />

      <div className="mb-8 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-muted rounded animate-pulse" />
          <div className="h-5 w-80 bg-muted rounded animate-pulse" />
        </div>
        {showDeleteButton && (
          <div className="h-10 w-20 bg-muted rounded animate-pulse" />
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                <div className="h-24 w-full bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <div className="h-6 w-40 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-12 w-full bg-muted rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
              <div className="h-10 w-full bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, optIndex) => (
                      <div
                        key={optIndex}
                        className="h-4 w-full bg-muted rounded animate-pulse"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
