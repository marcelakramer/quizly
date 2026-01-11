"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ExerciseListForm } from "@/components/ExerciseListForm";
import { ExerciseListFormSkeleton } from "@/components/ExerciseListFormSkeleton";
import { Question } from "@/types";

export default function EditList() {
  const router = useRouter();
  const params = useParams();
  const listId = params.listId as string;
  const { firebaseUser } = useAuth();

  const loadData = useCallback(async () => {
    if (!firebaseUser || !listId) {
      throw new Error("Missing required data");
    }

    const auth = getAuthInstance();
    const idToken = await auth.currentUser?.getIdToken();

    if (!idToken) {
      toast.error("You must be logged in.");
      router.push("/login");
      throw new Error("Not authenticated");
    }

    const { list } = await api.exercises.lists.getById(idToken, listId);

    if (list.submissions.length > 0) {
      toast.error("Cannot edit exercise list that has submissions.");
      router.push("/teacher/dashboard");
      throw new Error("List has submissions");
    }

    return {
      title: list.title,
      description: list.description || "",
      questions: list.questions.map((q) => ({
        id: q.id,
        title: q.title,
        type: q.type,
        options: q.options.map((opt) => ({
          label: opt.label,
          isCorrect: opt.isCorrect,
        })),
        order: q.order,
      })) as Question[],
    };
  }, [firebaseUser, listId, router]);

  if (!firebaseUser) {
    return (
      <div className="min-h-full bg-background">
        <main className="container py-8">
          <ExerciseListFormSkeleton showDeleteButton={true} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <main className="container py-8">
        <ExerciseListForm mode="edit" listId={listId} onLoadData={loadData} />
      </main>
    </div>
  );
}
