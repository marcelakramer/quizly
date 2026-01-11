"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, XCircle, User, Clock } from "lucide-react";
import { QuestionType } from "@teachy/db";
import { SubmissionDetail } from "@/types";
import { getResultMessage } from "@/lib/utils/exercise";
import { formatDateShort, formatTime } from "@/lib/utils/date";

interface SubmissionDetailsViewProps {
  submission: SubmissionDetail;
  onBack: () => void;
  backLabel: string;
  showResultCard: boolean;
  answersTitle: string;
  answerLabel: string;
  firstCardContent: {
    icon: typeof User;
    title: string;
    subtitle: string;
  };
}

export function SubmissionDetailsView({
  submission,
  onBack,
  backLabel,
  showResultCard,
  answersTitle,
  answerLabel,
  firstCardContent,
}: SubmissionDetailsViewProps) {
  const percentage = submission.score;
  const result = getResultMessage(percentage);
  const sortedAnswers = [...submission.answers].sort(
    (a, b) => a.question.order - b.question.order
  );

  const FirstCardIcon = firstCardContent.icon;

  return (
    <div className="min-h-full bg-background">
      <main className="container py-8">
        <Button
          variant="tertiary"
          onClick={onBack}
          className="mb-6 opacity-0 animate-fade-up"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Button>

        <div
          className="mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h1
            className="text-3xl font-bold text-foreground whitespace-pre-wrap break-words"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {submission.exerciseList.title}
          </h1>
          {submission.exerciseList.description && (
            <p
              className="mt-1 text-muted-foreground whitespace-pre-wrap break-words"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {submission.exerciseList.description}
            </p>
          )}
        </div>

        {showResultCard && (
          <Card
            className="glass-card mb-8 opacity-0 animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            <CardContent className="pt-6 pb-6 text-center">
              <div className="text-5xl mb-3">{result.emoji}</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {result.title}
              </h2>
              <p className="text-muted-foreground">{result.message}</p>
            </CardContent>
          </Card>
        )}

        <div
          className="grid gap-4 md:grid-cols-3 mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay: showResultCard ? "0.2s" : "0.15s" }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FirstCardIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-base font-medium text-foreground">
                    {firstCardContent.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {firstCardContent.subtitle}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {submission.correctAnswers}/{submission.totalQuestions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {percentage.toFixed(0)}% correct
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {formatDateShort(submission.createdAt)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(submission.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card
          className="glass-card opacity-0 animate-fade-up"
          style={{ animationDelay: showResultCard ? "0.3s" : "0.2s" }}
        >
          <CardHeader>
            <CardTitle className="text-xl text-foreground">
              {answersTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedAnswers.map((answer, index) => {
                const isOpenEnded =
                  answer.question.type === QuestionType.OPEN_ENDED;
                const isCorrect = answer.isCorrect;
                const correctOption = answer.question.options.find(
                  (opt) => opt.id === answer.correctOptionId
                );

                return (
                  <div
                    key={answer.questionId}
                    className={`rounded-lg p-4 border-2 ${
                      isOpenEnded
                        ? "bg-success/10 border-success/20"
                        : isCorrect
                          ? "bg-success/10 border-success/20"
                          : "bg-destructive/10 border-destructive/20"
                    } opacity-0 animate-fade-up`}
                    style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-3">
                      {isOpenEnded ? (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      ) : isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p
                          className="font-semibold text-foreground mb-2 whitespace-pre-wrap break-words"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          Q{index + 1}: {answer.question.title}
                        </p>
                        <div className="space-y-2">
                          {isOpenEnded ? (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                {answerLabel}:
                              </p>
                              <p
                                className="text-sm text-success whitespace-pre-wrap break-words"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 6,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {answer.textAnswer || "No answer provided"}
                              </p>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  {answerLabel}:
                                </p>
                                <p
                                  className={`text-sm ${
                                    isCorrect
                                      ? "text-success"
                                      : "text-destructive"
                                  } whitespace-pre-wrap break-words`}
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {answer.selectedOption?.label}
                                </p>
                              </div>
                              {!isCorrect && correctOption && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Correct Answer:
                                  </p>
                                  <p
                                    className="text-sm text-success font-medium whitespace-pre-wrap break-words"
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 4,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {correctOption.label}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
