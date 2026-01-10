"use client";

import Link from "next/link";
import { ExerciseList } from "@teachy/db";
import { ClipboardList, Users, Share2, Edit } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ExerciseListWithRelations = ExerciseList & {
  questions: { id: string }[];
  submissions: { id: string }[];
};

interface ExerciseListCardProps {
  list: ExerciseListWithRelations;
  index: number;
}

export function ExerciseListCard({ list, index }: ExerciseListCardProps) {
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/quiz/${list.shareCode}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!", {
        description: "Share this link with your students",
      });
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <Card
      className="opacity-0 animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{list.title}</CardTitle>
              {list.description && (
                <CardDescription className="mt-1">
                  {list.description}
                </CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{list.questions?.length || 0} questions</span>
            <span>•</span>
            <span>{list.submissions?.length || 0} submissions</span>
            <span>•</span>
            <span>
              {new Date(list.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {list.submissions?.length === 0 && (
              <Link href={`/teacher/exercise-lists/${list.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Link href={`/teacher/results/${list.id}`}>
              <Button variant="outline" size="sm">
                <Users className="mr-2 h-4 w-4" />
                Results
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
