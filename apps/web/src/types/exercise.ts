import { ExerciseList, Submission } from "@teachy/db";
import { Question } from "./question";
import { QuizQuestion } from "./quiz";

export type ExerciseListWithRelations = ExerciseList & {
  questions: Question[];
  submissions: Submission[];
};

export interface ExerciseListSummary {
  id: string;
  title: string;
  description: string | null;
  shareCode: string;
  questions: Array<{ id: string }>;
}

export interface ExerciseListDetail {
  id: string;
  title: string;
  description: string | null;
  shareCode: string;
  questions: QuizQuestion[];
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
}
