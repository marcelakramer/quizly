import { useMemo } from "react";
import { QuestionType } from "@teachy/db";
import { Option } from "@/types";

interface QuestionValidationResult {
  isValid: boolean;
  titleError: string | null;
  optionsError: string | null;
  correctOptionError: string | null;
}

export function useQuestionValidation(
  title: string,
  questionType: QuestionType,
  options: Option[],
  correctOptionIndex: number | null
): QuestionValidationResult {
  return useMemo(() => {
    const titleError = !title.trim() ? "Question text is required" : null;

    let optionsError: string | null = null;
    let correctOptionError: string | null = null;

    if (questionType === QuestionType.MULTIPLE_CHOICE) {
      if (!options || options.length < 2) {
        optionsError = "At least two options are required";
      } else if (options.some((opt) => !opt.label.trim())) {
        optionsError = "All options must be filled";
      }

      if (correctOptionIndex === null) {
        correctOptionError = "Select the correct option";
      }
    }

    const isValid = !titleError && !optionsError && !correctOptionError;

    return { isValid, titleError, optionsError, correctOptionError };
  }, [title, questionType, options, correctOptionIndex]);
}
