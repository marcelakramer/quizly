import { Question } from "./question";

export type QuizStep = "intro" | "quiz" | "complete";

export type QuizQuestion = Question;

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
