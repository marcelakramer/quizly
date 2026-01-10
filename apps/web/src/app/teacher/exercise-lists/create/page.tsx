"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, FileText } from "lucide-react";
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
import { useAuth } from "@/contexts/auth-context";
import { getAuthInstance } from "@teachy/firebase";
import { api } from "@/lib/api";
import { toast } from "sonner";

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

export default function CreateList() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      toast.error("Please enter a title");
      return;
    }
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create an exercise list");
      return;
    }

    setLoading(true);

    try {
      const auth = getAuthInstance();
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Not authenticated");
      }

      await api.exercises.lists.create(idToken, {
        title: title.trim(),
        description: description.trim() || null,
        questions: questions.map((q) => ({
          title: q.title,
          options: q.options,
          order: q.order,
        })),
      });

      toast.success("Exercise list created successfully!");
      router.push("/teacher/dashboard");
    } catch (error) {
      console.error("Error creating exercise list:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create exercise list"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <Link
          href="/teacher/dashboard"
          className="mb-6 inline-flex items-center text-muted-foreground hover:text-foreground transition-colors opacity-0 animate-fade-up"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div
          className="mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h1 className="text-3xl font-bold">Create Exercise List</h1>
          <p className="mt-1 text-muted-foreground">
            Add questions to create an assessment for your students
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div
            className="space-y-6 opacity-0 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="glass-card rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                List Details
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="e.g., Introduction to Fractions"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium"
                  >
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    placeholder="Describe this exercise list..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            </div>

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
              <button
                onClick={handleSave}
                disabled={!title.trim() || questions.length === 0 || loading}
                className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save List"}
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="glass-card rounded-lg p-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    No questions yet. Add your first question using the form.
                  </p>
                </div>
              </div>
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
      </main>
    </div>
  );
}
