"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { ExerciseListCard } from "@/components/ExerciseListCard";
import { ExerciseListCardSkeletons } from "@/components/ExerciseListCardSkeletons";
import { EmptyState } from "@/components/EmptyState";
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
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="opacity-0 animate-fade-up">
            <h1 className="text-3xl font-bold">My Exercise Lists</h1>
            <p className="mt-1 text-muted-foreground">
              Create and manage quizzes for your students
            </p>
          </div>
          <Link
            href="/teacher/exercise-lists/create"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all opacity-0 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New List
          </Link>
        </div>

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
