import { useMemo } from "react";
import { Question as LocalQuestion } from "@/types";
import { QuestionType } from "@teachy/db";

type AnswersMap = Record<string, string>;

interface QuizValidationResult {
  allFilled: boolean;
  missingQuestionIds: string[];
}

export function useQuizValidation(
  questions: LocalQuestion[] | undefined,
  answers: AnswersMap,
  textAnswers: AnswersMap
): QuizValidationResult {
  return useMemo(() => {
    if (!questions || questions.length === 0) {
      return { allFilled: false, missingQuestionIds: [] };
    }

    const missing: string[] = [];

    for (const q of questions) {
      if (q.type === QuestionType.OPEN_ENDED) {
        if (!textAnswers[q.id] || !textAnswers[q.id].trim()) {
          missing.push(q.id);
        }
      } else {
        if (!answers[q.id]) {
          missing.push(q.id);
        }
      }
    }

    return { allFilled: missing.length === 0, missingQuestionIds: missing };
  }, [questions, answers, textAnswers]);
}
