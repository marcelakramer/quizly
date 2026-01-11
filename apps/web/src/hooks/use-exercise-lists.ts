"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { ExerciseListWithRelations } from "@/types";

export function useExerciseLists() {
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

  return { exerciseLists, loading };
}
