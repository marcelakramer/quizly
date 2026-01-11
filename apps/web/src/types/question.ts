import { QuestionType } from "@teachy/db";

export interface Option {
  id?: string;
  label: string;
  isCorrect: boolean;
}

export interface Question {
  id?: string;
  title: string;
  type: QuestionType;
  options: Option[];
  order: number;
}
