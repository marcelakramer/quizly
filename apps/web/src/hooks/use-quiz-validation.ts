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
      const qid = q.id ?? "";
      if (q.type === QuestionType.OPEN_ENDED) {
        if (!textAnswers[qid] || !textAnswers[qid].trim()) {
          missing.push(qid);
        }
      } else {
        if (!answers[qid]) {
          missing.push(qid);
        }
      }
    }

    return { allFilled: missing.length === 0, missingQuestionIds: missing };
  }, [questions, answers, textAnswers]);
}
