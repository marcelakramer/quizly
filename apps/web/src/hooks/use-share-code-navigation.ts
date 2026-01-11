"use client";

import { useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

export function useShareCodeNavigation() {
  const router = useRouter();
  const [shareCode, setShareCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!shareCode.trim()) {
        toast.error("Please enter a quiz code.");
        return;
      }

      setLoading(true);

      try {
        await api.quiz.getByShareCode(shareCode.trim().toUpperCase());
        router.push(`/quiz/${shareCode.trim().toUpperCase()}`);
      } catch (error) {
        console.error("Error validating quiz code:", error);
        setShareCode("");
        toast.error(
          error instanceof Error
            ? error.message.endsWith(".")
              ? error.message
              : `${error.message}.`
            : "Invalid quiz code. Please check and try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [shareCode, router]
  );

  const updateShareCode = useCallback((value: string) => {
    setShareCode(value.toUpperCase());
  }, []);

  return {
    shareCode,
    loading,
    handleSubmit,
    updateShareCode,
  };
}
