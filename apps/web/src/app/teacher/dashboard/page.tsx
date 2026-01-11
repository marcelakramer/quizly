"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { ExerciseListCard } from "@/components/ExerciseListCard";
import { ExerciseListCardSkeletons } from "@/components/ExerciseListCardSkeletons";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList } from "lucide-react";
import { ExerciseListWithRelations } from "@/types";

export default function TeacherDashboard() {
  const { firebaseUser } = useAuth();
  const [exerciseLists, setExerciseLists] = useState<
    ExerciseListWithRelations[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExerciseLists = async () => {
      if (!firebaseUser) return;

      try {
        const auth = getAuthInstance();
        const idToken = await auth.currentUser?.getIdToken();
        if (idToken) {
          const { lists } = await api.exercises.lists.getAll(idToken);
          setExerciseLists(lists);
        }
      } catch (error) {
        console.error("Error fetching exercise lists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseLists();
  }, [firebaseUser]);

  return (
    <div className="min-h-full bg-background">
      <main className="container py-8">
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
      </main>
    </div>
  );
}
