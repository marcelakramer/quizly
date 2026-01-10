import { QuestionType } from "@teachy/db";

export interface SubmissionDetail {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  createdAt: Date;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  exerciseList: {
    id: string;
    title: string;
    description: string | null;
    shareCode: string;
    questions: Array<{
      id: string;
      title: string;
      type: QuestionType;
      order: number;
      options: Array<{
        id: string;
        label: string;
        isCorrect: boolean;
      }>;
    }>;
    teacher?: {
      id: string;
      name: string;
      email: string;
    };
  };
  answers: Array<{
    questionId: string;
    question: {
      id: string;
      title: string;
      type: QuestionType;
      order: number;
      options: Array<{
        id: string;
        label: string;
        isCorrect: boolean;
      }>;
    };
    selectedOptionId?: string;
    selectedOption?: {
      id: string;
      label: string;
      isCorrect: boolean;
    };
    textAnswer?: string;
    isCorrect?: boolean;
    correctOptionId?: string;
  }>;
}

export interface SubmissionResult {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  createdAt?: Date;
  answers: Array<{
    questionId: string;
    selectedOptionId?: string;
    textAnswer?: string;
    isCorrect?: boolean;
    correctOptionId?: string;
  }>;
}

export interface StudentSubmission {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  createdAt: Date;
  exerciseList: {
    id: string;
    title: string;
    description: string | null;
    shareCode: string;
    teacher: {
      id: string;
      name: string;
      email: string;
    };
    questionCount: number;
  };
}

export interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: Date;
}
