"use client";

import { Check, Trash2, GripVertical, Edit } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { QuestionType } from "@teachy/db";
import { Question } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuestionPreviewProps {
  question: Question;
  index: number;
  onRemove: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function QuestionPreview({
  question,
  index,
  onRemove,
  onEdit,
}: QuestionPreviewProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="glass-card animate-scale-in"
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div
            {...attributes}
            {...listeners}
            className="flex items-center gap-2 text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-7 w-7" />
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-base font-medium text-primary">
              {index + 1}
            </span>
          </div>

          <div className="flex-1 space-y-3">
            <p className="font-medium">{question.title}</p>
            {question.type === QuestionType.OPEN_ENDED ? (
              <div className="rounded-lg px-3 py-2 text-sm bg-muted/50 text-muted-foreground">
                Open-ended question
              </div>
            ) : (
              <div className="grid gap-2">
                {question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      option.isCorrect
                        ? "bg-success/10 text-success"
                        : "bg-muted/50"
                    }`}
                  >
                    {option.isCorrect && <Check className="h-6 w-6" />}
                    <span>{option.label}</span>
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
        </div>
      </CardContent>
    </Card>
  );
}
