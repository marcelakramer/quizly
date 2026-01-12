"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function ExerciseListCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-muted animate-pulse" />

          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          className={cn(
            "flex flex-wrap gap-x-4 gap-y-2",
            "sm:flex-nowrap sm:items-center sm:gap-6"
          )}
        >
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
        </div>

        <div
          className={cn("flex gap-2", "flex-col sm:flex-row sm:justify-end")}
        >
          <div className="h-9 w-full sm:w-20 rounded bg-muted animate-pulse" />
          <div className="h-9 w-full sm:w-20 rounded bg-muted animate-pulse" />
          <div className="h-9 w-full sm:w-24 rounded bg-muted animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
