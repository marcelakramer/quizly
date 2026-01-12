"use client";

import Link from "next/link";
import { StudentSubmission } from "@/types/submission";
import { formatDate } from "@/lib/utils/date";
import { getScoreColorClass } from "@/lib/utils/exercise";
import { User, Clock, FileText } from "lucide-react";

interface ResultListItemProps {
  submission: StudentSubmission;
  index: number;
}

export function ResultListItem({ submission, index }: ResultListItemProps) {
  const percentage = submission.score;
  const scoreColorClass = getScoreColorClass(percentage);

  return (
    <Link
      key={submission.id}
      href={`/results/${submission.id}`}
      className="block rounded-lg border border-border/50 p-4 hover:border-primary/50 hover:bg-primary/5 transition-all opacity-0 animate-fade-up active:scale-[0.99] active:brightness-95"
      style={{ animationDelay: `${0.4 + index * 0.05}s` }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1">
            {submission.exerciseList.title}
          </h3>
          {submission.exerciseList.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {submission.exerciseList.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 min-w-0">
              <User className="h-3 w-3" />
              <span className="truncate">
                {submission.exerciseList.teacher.name}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {submission.exerciseList.questionCount} questions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(submission.createdAt)}
            </span>
          </div>
        </div>
        <div className="text-right sm:ml-4 mt-3 sm:mt-0 self-end sm:self-auto w-full sm:w-auto">
          <p className={`text-lg font-bold ${scoreColorClass}`}>
            {submission.correctAnswers}/{submission.totalQuestions}
          </p>
          <p className="text-sm text-muted-foreground">
            {percentage.toFixed(0)}%
          </p>
        </div>
      </div>
    </Link>
  );
}
