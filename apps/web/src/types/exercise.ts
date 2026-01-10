import { ExerciseList, QuestionType } from "@teachy/db";

export type ExerciseListWithRelations = ExerciseList & {
  questions: { id: string }[];
  submissions: { id: string }[];
};

export interface QuizQuestion {
  id: string;
  title: string;
  type: QuestionType;
  order: number;
  options: Array<{
    id: string;
    label: string;
    isCorrect: boolean;
  }>;
}

export interface QuizList {
  id: string;
  title: string;
  description: string | null;
  questions: QuizQuestion[];
  teacher: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ExerciseListSummary {
  id: string;
  title: string;
  description: string | null;
  shareCode: string;
  questions: Array<{ id: string }>;
}
