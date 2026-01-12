"use client";

import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils/date";
import { getScoreColorClass } from "@/lib/utils/exercise";
import { Submission } from "@/types";

interface SubmissionListItemProps {
  submission: Submission;
  animationDelay?: string;
}

export function SubmissionListItem({
  submission,
  animationDelay,
}: SubmissionListItemProps) {
  const percentage = submission.percentage;

  return (
    <Link
      href={`/results/${submission.id}`}
      className="flex items-center justify-between rounded-lg border border-border/50 p-4 opacity-0 animate-fade-up hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer active:scale-[0.99] active:brightness-95"
      style={animationDelay ? { animationDelay } : undefined}
    >
      <div className="flex items-center gap-3 min-w-0 mr-1 flex-1">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
          {submission.studentName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{submission.studentName}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(submission.submittedAt)} at{" "}
            {formatTime(submission.submittedAt)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-lg font-bold ${getScoreColorClass(percentage)}`}>
          {submission.score}/{submission.totalQuestions}
        </p>
        <p className="text-sm text-muted-foreground">
          {percentage.toFixed(0)}%
        </p>
      </div>
    </Link>
  );
}
