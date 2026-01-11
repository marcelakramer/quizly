"use client";

import { ExerciseListForm } from "@/components/exercise";
import { PageContainer } from "@/components/layout";

export default function CreateList() {
  return (
    <PageContainer>
      <ExerciseListForm mode="create" />
    </PageContainer>
  );
}
