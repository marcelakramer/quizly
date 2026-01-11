"use client";

import { ExerciseListCardSkeleton } from "./ExerciseListCardSkeleton";

interface ExerciseListCardSkeletonsProps {
  count?: number;
}

export function ExerciseListCardSkeletons({
  count = 3,
}: ExerciseListCardSkeletonsProps) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ExerciseListCardSkeleton key={index} />
      ))}
    </div>
  );
}
