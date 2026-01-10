"use client";

import { X, CheckCircle2, Circle, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Option {
  label: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  title: string;
  options: Option[];
  order: number;
}

interface QuestionPreviewProps {
  question: Question;
  index: number;
  onRemove: (id: string) => void;
}

export function QuestionPreview({
  question,
  index,
  onRemove,
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
    <div
      ref={setNodeRef}
      style={style}
      className="glass-card rounded-lg p-6 relative"
    >
      <button
        onClick={() => onRemove(question.id)}
        className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-destructive transition-colors z-10"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 mb-4">
        <button
          {...attributes}
          {...listeners}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm cursor-grab active:cursor-grabbing hover:bg-primary/20 transition-colors touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
          {index + 1}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-3">
            {question.title}
          </h4>
          <div className="space-y-2">
            {question.options.map((option, optIndex) => (
              <div
                key={optIndex}
                className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                  option.isCorrect
                    ? "bg-success/10 border border-success/20"
                    : "bg-muted"
                }`}
              >
                {option.isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span
                  className={option.isCorrect ? "text-success font-medium" : ""}
                >
                  {option.label}
                </span>
                {option.isCorrect && (
                  <span className="ml-auto text-xs text-success font-medium">
                    Correct
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
