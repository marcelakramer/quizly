"use client";

import { ExerciseListForm } from "@/components/ExerciseListForm";
import { PageContainer } from "@/components/PageContainer";

export default function CreateList() {
  return (
    <PageContainer>
      <ExerciseListForm mode="create" />
    </PageContainer>
  );
}
