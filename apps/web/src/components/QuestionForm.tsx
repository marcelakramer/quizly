"use client";

import { useState, useEffect, FormEvent } from "react";
import { Plus, X, Edit } from "lucide-react";
import { toast } from "sonner";
import { QuestionType } from "@teachy/db";
import { Question, Option } from "@/types";

interface QuestionFormProps {
  onAddQuestion: (question: Question) => void;
  initialQuestion?: Question | null;
  onUpdateQuestion?: (question: Question) => void;
  onCancel?: () => void;
}

export function QuestionForm({
  onAddQuestion,
  initialQuestion,
  onUpdateQuestion,
  onCancel,
}: QuestionFormProps) {
  const isEditing = !!initialQuestion;
  const [title, setTitle] = useState(initialQuestion?.title || "");
  const [questionType, setQuestionType] = useState<QuestionType>(
    initialQuestion?.type || QuestionType.MULTIPLE_CHOICE
  );
  const [options, setOptions] = useState<Option[]>(
    initialQuestion?.options || [
      { label: "", isCorrect: false },
      { label: "", isCorrect: false },
    ]
  );

  // Update form when initialQuestion changes
  useEffect(() => {
    if (initialQuestion) {
      setTitle(initialQuestion.title);
      setQuestionType(initialQuestion.type);
      setOptions(initialQuestion.options);
    } else {
      setTitle("");
      setQuestionType(QuestionType.MULTIPLE_CHOICE);
      setOptions([
        { label: "", isCorrect: false },
        { label: "", isCorrect: false },
      ]);
    }
  }, [initialQuestion]);

  const handleAddOption = () => {
    setOptions([...options, { label: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, label: string) => {
    const newOptions = [...options];
    newOptions[index].label = label;
    setOptions(newOptions);
  };

  const handleCorrectChange = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a question title.");
      return;
    }

    if (questionType === QuestionType.MULTIPLE_CHOICE) {
      if (options.some((opt) => !opt.label.trim())) {
        toast.error("Please fill in all options.");
        return;
      }

      if (!options.some((opt) => opt.isCorrect)) {
        toast.error("Please select a correct answer.");
        return;
      }
    }

    const question: Question = {
      id: initialQuestion?.id || Date.now().toString(),
      title: title.trim(),
      type: questionType,
      options:
        questionType === QuestionType.MULTIPLE_CHOICE
          ? options.map((opt) => ({
              label: opt.label.trim(),
              isCorrect: opt.isCorrect,
            }))
          : [],
      order: initialQuestion?.order || 0,
    };

    if (isEditing && onUpdateQuestion) {
      onUpdateQuestion(question);
      toast.success("Question updated successfully!");
      onCancel?.();
    } else {
      onAddQuestion(question);
      toast.success("Question added successfully!");
      setTitle("");
      setQuestionType(QuestionType.MULTIPLE_CHOICE);
      setOptions([
        { label: "", isCorrect: false },
        { label: "", isCorrect: false },
      ]);
    }
  };

  return (
    <div className="glass-card rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        {isEditing ? (
          <>
            <Edit className="h-5 w-5 text-primary" />
            Edit Question
          </>
        ) : (
          <>
            <Plus className="h-5 w-5 text-primary" />
            Add Question
          </>
        )}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="question-type" className="block text-sm font-medium">
            Question Type
          </label>
          <select
            id="question-type"
            value={questionType}
            onChange={(e) => {
              setQuestionType(e.target.value as QuestionType);
              if (e.target.value === QuestionType.OPEN_ENDED) {
                setOptions([]);
              } else if (options.length === 0) {
                setOptions([
                  { label: "", isCorrect: false },
                  { label: "", isCorrect: false },
                ]);
              }
            }}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={QuestionType.MULTIPLE_CHOICE}>
              Multiple Choice
            </option>
            <option value={QuestionType.OPEN_ENDED}>Open-ended</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="question-title" className="block text-sm font-medium">
            Question
          </label>
          <input
            id="question-title"
            type="text"
            placeholder="Enter your question..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {questionType === QuestionType.MULTIPLE_CHOICE && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Options</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={option.isCorrect}
                    onChange={() => handleCorrectChange(index)}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option.label}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddOption}
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Option
            </button>
          </div>
        )}

        <div className="flex gap-2">
          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-border hover:bg-muted px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={`${
              isEditing ? "flex-1" : "w-full"
            } bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors`}
          >
            {isEditing ? "Update Question" : "Add Question"}
          </button>
        </div>
      </form>
    </div>
  );
}
