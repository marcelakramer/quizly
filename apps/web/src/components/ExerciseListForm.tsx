"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, FileText, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { QuestionForm } from "@/components/QuestionForm";
import { QuestionPreview } from "@/components/QuestionPreview";
import { EmptyState } from "@/components/EmptyState";
import { ExerciseListFormSkeleton } from "@/components/ExerciseListFormSkeleton";
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/types";

interface ExerciseListFormProps {
  mode: "create" | "edit";
  listId?: string;
  onLoadData?: () => Promise<{
    title: string;
    description: string;
    questions: Question[];
  }>;
}

export function ExerciseListForm({
  mode,
  listId,
  onLoadData,
}: ExerciseListFormProps) {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(mode === "edit");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (mode === "create") {
      setLoadingData(false);
      return;
    }

    if (mode === "edit" && onLoadData && firebaseUser) {
      setLoadingData(true);
      const fetchList = async () => {
        try {
          const data = await onLoadData();
          setTitle(data.title);
          setDescription(data.description || "");
          setQuestions(data.questions);
        } catch (error) {
          console.error("Error fetching exercise list:", error);
          toast.error(
            error instanceof Error
              ? error.message.endsWith(".")
                ? error.message
                : `${error.message}.`
              : "Failed to load exercise list."
          );
          router.push("/teacher/dashboard");
        } finally {
          setLoadingData(false);
        }
      };

      fetchList();
    }
  }, [mode, onLoadData, firebaseUser, router]);

  if (loadingData) {
    return <ExerciseListFormSkeleton showDeleteButton={mode === "edit"} />;
  }

  const handleAddQuestion = (question: Question) => {
    const questionWithOrder = {
      ...question,
      order: questions.length,
    };
    setQuestions([...questions, questionWithOrder]);
  };

  const handleRemoveQuestion = (id: string) => {
    const newQuestions = questions
      .filter((q) => q.id !== id)
      .map((q, index) => ({ ...q, order: index }));
    setQuestions(newQuestions);
    if (editingQuestionId === id) {
      setEditingQuestionId(null);
    }
  };

  const handleEditQuestion = (id: string) => {
    setEditingQuestionId(id);
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
    setEditingQuestionId(null);
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({
          ...item,
          order: index,
        }));
      });
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (questions.length === 0) {
      toast.error("Please add at least one question.");
      return;
    }

    if (!firebaseUser) {
      toast.error(
        `You must be logged in to ${mode === "create" ? "create" : "update"} an exercise list.`
      );
      return;
    }

    setLoading(true);

    try {
      const auth = getAuthInstance();
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Not authenticated");
      }

      const questionsData = questions.map((q) => ({
        title: q.title,
        type: q.type,
        options: q.options,
        order: q.order,
      }));

      if (mode === "create") {
        await api.exercises.lists.create(idToken, {
          title: title.trim(),
          description: description.trim() || null,
          questions: questionsData,
        });
        toast.success("Exercise list created successfully!");
      } else if (listId) {
        await api.exercises.lists.update(idToken, listId, {
          title: title.trim(),
          description: description.trim() || null,
          questions: questionsData,
        });
        toast.success("Exercise list updated successfully!");
      }

      router.push("/teacher/dashboard");
    } catch (error) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} exercise list:`,
        error
      );
      toast.error(
        error instanceof Error
          ? error.message.endsWith(".")
            ? error.message
            : `${error.message}.`
          : `Failed to ${mode === "create" ? "create" : "update"} exercise list.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!firebaseUser || !listId) {
      toast.error("You must be logged in to delete an exercise list.");
      return;
    }

    setDeleting(true);

    try {
      const auth = getAuthInstance();
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Not authenticated");
      }

      await api.exercises.lists.delete(idToken, listId);

      toast.success("Exercise list deleted successfully!");
      router.push("/teacher/dashboard");
    } catch (error) {
      console.error("Error deleting exercise list:", error);
      toast.error(
        error instanceof Error
          ? error.message.endsWith(".")
            ? error.message
            : `${error.message}.`
          : "Failed to delete exercise list."
      );
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Button
        variant="tertiary"
        onClick={() => router.push("/teacher/dashboard")}
        className="mb-6 opacity-0 animate-fade-up"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div
        className="mb-8 flex items-start justify-between opacity-0 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        <div>
          <h1 className="text-3xl font-bold">
            {mode === "create" ? "Create Exercise List" : "Edit Exercise List"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {mode === "create"
              ? "Add questions to create an assessment for your students"
              : "Update questions and details for your assessment"}
          </p>
        </div>
        {mode === "edit" && (
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div
          className="space-y-6 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                List Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Title"
                id="title"
                name="title"
                placeholder="e.g., Introduction to Fractions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setTitle((s) => s.trim())}
                maxLength={150}
              />
              <FormField
                label="Description (optional)"
                as="textarea"
                id="description"
                name="description"
                placeholder="Describe this exercise list..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => setDescription((s) => s.trim())}
                maxLength={500}
                rows={3}
                autoGrow
                showCounter={true}
              />
            </CardContent>
          </Card>

          <QuestionForm
            onAddQuestion={handleAddQuestion}
            initialQuestion={
              editingQuestionId
                ? questions.find((q) => q.id === editingQuestionId) || null
                : null
            }
            onUpdateQuestion={handleUpdateQuestion}
            onCancel={handleCancelEdit}
          />
        </div>

        <div
          className="space-y-6 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Questions ({questions.length})
            </h2>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || questions.length === 0 || loading}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Save List"
                  : "Update List"}
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card className="glass-card">
              <CardContent>
                <EmptyState
                  icon={FileText}
                  title="No questions yet"
                  description="Add your first question using the form."
                  className="py-12"
                />
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={questions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <QuestionPreview
                      key={question.id}
                      question={question}
                      index={index}
                      onRemove={handleRemoveQuestion}
                      onEdit={handleEditQuestion}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {mode === "edit" && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Exercise List</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{title}&quot;? This action
                cannot be undone and will permanently delete all questions and
                any associated data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="tertiary"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  "Deleting..."
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
