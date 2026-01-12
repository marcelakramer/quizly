"use client";

import Link from "next/link";
import {
  ClipboardList,
  Users,
  Share2,
  Edit,
  ListCheckIcon,
  CalendarIcon,
  UsersIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExerciseListWithRelations } from "@/types";
import { formatDateShort } from "@/lib/utils/date";

interface ExerciseListCardProps {
  list: ExerciseListWithRelations;
  index: number;
}

export function ExerciseListCard({ list, index }: ExerciseListCardProps) {
  const shareUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/quiz/${list.shareCode}`;

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
        <div className="flex gap-3 items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <CardTitle className="text-lg truncate">{list.title}</CardTitle>
              {list.description && (
                <CardDescription className="mt-1 whitespace-pre-wrap break-words">
                  {list.description}
                </CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-2">
              <ListCheckIcon size={14} />
              <span>
                <span className="font-medium">
                  {list.questions?.length || 0}
                </span>{" "}
                questions
              </span>
            </div>

            <div className="flex items-center gap-2">
              <UsersIcon size={14} />
              <span>
                <span className="font-medium">
                  {list.submissions?.length || 0}
                </span>{" "}
                submissions
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon size={14} />
              <span>{formatDateShort(list.createdAt)}</span>
            </div>
          </div>

          <div className="flex gap-2 items-center justify-end">
            {list.submissions?.length === 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/teacher/exercise-lists/${list.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>

            <Button asChild variant="outline" size="sm">
              <Link href={`/teacher/results/${list.id}`}>
                <Users className="mr-2 h-4 w-4" />
                Results
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
