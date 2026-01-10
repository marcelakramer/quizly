"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { ExerciseList } from "@teachy/db";
import { ExerciseListCard } from "@/components/ExerciseListCard";
import { LoadingSpinner } from "@/components/LoadingIcon";
import { Plus, ClipboardList } from "lucide-react";

type ExerciseListWithRelations = ExerciseList & {
  questions: { id: string }[];
  submissions: { id: string }[];
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [exerciseLists, setExerciseLists] = useState<
    ExerciseListWithRelations[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExerciseLists = async () => {
      if (!user) return;

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
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

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

        {exerciseLists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center opacity-0 animate-fade-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">No exercise lists yet</h2>
            <p className="mt-2 text-muted-foreground max-w-sm">
              Create your first exercise list to start assessing your students
            </p>
            <Link
              href="/teacher/exercise-lists/create"
              className="mt-6 inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First List
            </Link>
          </div>
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
