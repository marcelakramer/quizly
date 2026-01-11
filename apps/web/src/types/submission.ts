import { Question, Option } from "./question";
import { ExerciseListDetail } from "./exercise";

export interface AnswerBase {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  isCorrect?: boolean;
  correctOptionId?: string;
}

export interface AnswerDetail extends AnswerBase {
  question: Question;
  selectedOption?: Option;
}

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
  exerciseList: ExerciseListDetail;
  answers: AnswerDetail[];
}

export interface SubmissionResult {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  createdAt?: Date;
  answers: AnswerBase[];
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

export interface SubmissionCheck {
  hasSubmission: boolean;
  submission?: SubmissionResult;
}
