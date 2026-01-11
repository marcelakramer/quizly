"use client";

import { useState, useEffect, FormEvent } from "react";
import { Plus, Trash2, Check, Edit } from "lucide-react";
import { toast } from "sonner";
import { QuestionType } from "@teachy/db";
import { Question, Option } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import React from "react";
import { useQuestionValidation } from "@/hooks/use-question-validation";

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
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(
    initialQuestion?.options?.findIndex((opt) => opt.isCorrect) ?? null
  );

  useEffect(() => {
    if (initialQuestion) {
      setTitle(initialQuestion.title);
      setQuestionType(initialQuestion.type);
      setOptions(initialQuestion.options);
      setCorrectOptionIndex(
        initialQuestion.options?.findIndex((opt) => opt.isCorrect) ?? null
      );
    } else {
      setTitle("");
      setQuestionType(QuestionType.MULTIPLE_CHOICE);
      setOptions([
        { label: "", isCorrect: false },
        { label: "", isCorrect: false },
      ]);
      setCorrectOptionIndex(null);
    }
  }, [initialQuestion]);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, { label: "", isCorrect: false }]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctOptionIndex === index) {
        setCorrectOptionIndex(null);
      } else if (correctOptionIndex !== null && correctOptionIndex > index) {
        setCorrectOptionIndex(correctOptionIndex - 1);
      }
    }
  };

  const handleOptionChange = (index: number, label: string) => {
    const newOptions = [...options];
    newOptions[index].label = label;
    setOptions(newOptions);
  };

  const handleCorrectChange = (index: string) => {
    const idx = parseInt(index);
    setCorrectOptionIndex(idx);
  };

  const { isValid, titleError, optionsError, correctOptionError } =
    useQuestionValidation(title, questionType, options, correctOptionIndex);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      if (titleError) {
        toast.error(titleError);
        return;
      }

      if (optionsError) {
        toast.error(optionsError);
        return;
      }

      if (correctOptionError) {
        toast.error(correctOptionError);
        return;
      }
      return;
    }

    const question: Question = {
      id: initialQuestion?.id || Date.now().toString(),
      title: title.trim(),
      type: questionType,
      options:
        questionType === QuestionType.MULTIPLE_CHOICE
          ? options.map((opt, index) => ({
              label: opt.label.trim(),
              isCorrect: index === correctOptionIndex,
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
      setCorrectOptionIndex(null);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
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
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question-type">Question Type</Label>
            <Select
              value={questionType}
              onValueChange={(value) => {
                setQuestionType(value as QuestionType);
                if (value === QuestionType.OPEN_ENDED) {
                  setOptions([]);
                  setCorrectOptionIndex(null);
                } else if (options.length === 0) {
                  setOptions([
                    { label: "", isCorrect: false },
                    { label: "", isCorrect: false },
                  ]);
                }
              }}
              options={[
                {
                  value: QuestionType.MULTIPLE_CHOICE,
                  label: "Multiple Choice",
                },
                { value: QuestionType.OPEN_ENDED, label: "Open-ended" },
              ]}
              placeholder="Select question type"
            />
          </div>

          <FormField
            label="Question Text"
            as="textarea"
            id="question-title"
            name="question-title"
            placeholder="Enter your question..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTitle((s) => s.trim())}
            maxLength={500}
            rows={1}
            autoGrow
          />

          {questionType === QuestionType.MULTIPLE_CHOICE && (
            <div className="space-y-3">
              <Label>Answer Options (select the correct one)</Label>
              <RadioGroup
                value={
                  correctOptionIndex !== null
                    ? correctOptionIndex.toString()
                    : ""
                }
                onValueChange={handleCorrectChange}
              >
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                    />
                    <div className="flex-1 flex items-center gap-2">
                      <Textarea
                        placeholder={`Option ${index + 1}`}
                        value={option.label}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        onBlur={() =>
                          handleOptionChange(index, option.label.trim())
                        }
                        maxLength={255}
                        rows={1}
                        autoGrow
                        className="flex-1"
                      />
                    </div>
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                        className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-6 w-6" />
                      </Button>
                    )}
                    {correctOptionIndex === index && (
                      <Check className="h-6 w-6 text-success" />
                    )}
                  </div>
                ))}
              </RadioGroup>
              {options.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {isEditing && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isValid}
              className={isEditing ? "flex-1" : "w-full"}
            >
              {isEditing ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Update Question
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Add Question
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
