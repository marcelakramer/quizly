"use client";

import Link from "next/link";
import { useExerciseLists } from "@/hooks/use-exercise-lists";
import {
  ExerciseListCard,
  ExerciseListCardSkeletons,
} from "@/components/exercise";
import { EmptyState } from "@/components/common";
import { PageHeader, PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList } from "lucide-react";

export default function TeacherDashboard() {
  const { exerciseLists, loading } = useExerciseLists();

  return (
    <PageContainer>
      <PageHeader
        title="My Exercise Lists"
        description="Create and manage quizzes for your students"
        actions={
          <Button asChild>
            <Link href="/teacher/exercise-lists/create">
              <Plus className="mr-2 h-4 w-4" />
              Create New List
            </Link>
          </Button>
        }
      />

      {loading ? (
        <ExerciseListCardSkeletons count={3} />
      ) : exerciseLists.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No exercise lists yet"
          description="Create your first exercise list to start assessing your students"
          buttonText="Create Your First List"
          buttonHref="/teacher/exercise-lists/create"
          buttonIcon={Plus}
        />
      ) : (
        <div className="grid gap-4">
          {exerciseLists.map((list, index) => (
            <ExerciseListCard key={list.id} list={list} index={index} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
