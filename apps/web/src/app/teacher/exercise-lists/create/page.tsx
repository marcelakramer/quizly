"use client";

import { ExerciseListForm } from "@/components/ExerciseListForm";

export default function CreateList() {
  return (
    <div className="min-h-full bg-background">
      <main className="container py-8">
        <ExerciseListForm mode="create" />
      </main>
    </div>
  );
}
