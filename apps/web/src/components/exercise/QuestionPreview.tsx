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

// Memoized content that doesn't depend on index
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
    <>
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
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm w-full min-w-0 ${
                  option.isCorrect
                    ? "bg-success/10 text-success"
                    : "bg-muted/50"
                }`}
              >
                {option.isCorrect && (
                  <Check className="h-6 w-6 flex-shrink-0" />
                )}
                <span className="flex-1 min-w-0 whitespace-pre-wrap break-words">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(question.id)}
            className="h-10 w-10 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <Edit className="h-6 w-6" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(question.id)}
          className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-6 w-6" />
        </Button>
      </div>
    </>
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
    id: question.id,
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
          isDragging ? "shadow-2xl scale-[1.02] cursor-grabbing" : ""
        } ${isNew ? "animate-scale-in" : ""}`}
      >
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="flex items-center gap-2 text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="h-7 w-7" />
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-base font-medium text-primary transition-all duration-200">
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
