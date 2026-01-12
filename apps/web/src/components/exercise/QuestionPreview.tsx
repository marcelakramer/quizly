"use client";

import { memo } from "react";
import { Check, Trash2, GripVertical, Edit } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { QuestionType } from "@teachy/db";
import { Question } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TitleClamp } from "@/components/common";

interface QuestionPreviewProps {
  question: Question;
  index: number;
  onRemove: (id: string) => void;
  onEdit?: (id: string) => void;
  isNew?: boolean;
}

const QuestionContent = memo(function QuestionContent({
  question,
  onRemove,
  onEdit,
}: {
  question: Question;
  onRemove: (id: string) => void;
  onEdit?: (id: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
      <div className="flex-1 min-w-0 space-y-3">
        <TitleClamp title={question.title} />

        {question.type === QuestionType.OPEN_ENDED ? (
          <div className="rounded-lg px-3 py-2 text-sm bg-muted/50 text-muted-foreground">
            Open-ended question
          </div>
        ) : (
          <div className="grid gap-2">
            {question.options.map((option, optIndex) => (
              <div
                key={optIndex}
                className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                  option.isCorrect
                    ? "bg-success/10 text-success"
                    : "bg-muted/50"
                }`}
              >
                {option.isCorrect && (
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5" />
                )}
                <span className="min-w-0 overflow-hidden break-all whitespace-pre-wrap">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex sm:flex-col items-center gap-2 self-start sm:self-auto">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => question.id && onEdit(question.id)}
            className="h-10 w-10 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <Edit className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => question.id && onRemove(question.id)}
          className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>
    </div>
  );
});

export function QuestionPreview({
  question,
  index,
  onRemove,
  onEdit,
  isNew,
}: QuestionPreviewProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.id ?? String(index),
    transition: {
      duration: 300,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`glass-card transition-shadow duration-200 ${
          isDragging ? "shadow-2xl scale-[1.02]" : ""
        } ${isNew ? "animate-scale-in" : ""}`}
      >
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="flex items-center gap-2 text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="h-6 w-6 sm:h-7 sm:w-7" />
              <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/10 text-sm sm:text-base font-medium text-primary">
                {index + 1}
              </span>
            </div>

            <QuestionContent
              question={question}
              onRemove={onRemove}
              onEdit={onEdit}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
