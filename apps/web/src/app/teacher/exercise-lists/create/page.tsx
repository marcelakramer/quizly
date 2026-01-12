"use client";
export const dynamic = "force-dynamic";

import { ExerciseListForm } from "@/components/exercise";
import { PageContainer } from "@/components/layout";

export default function CreateList() {
  return (
    <PageContainer>
      <ExerciseListForm mode="create" />
    </PageContainer>
  );
}
