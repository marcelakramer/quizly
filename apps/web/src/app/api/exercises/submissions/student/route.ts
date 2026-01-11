import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@teachy/db";
import { requireStudent, handleApiError } from "@/lib/api/server";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireStudent(request);

    const submissions = await prisma.submission.findMany({
      where: { studentId: user.id },
      include: {
        exerciseList: {
          include: {
            questions: true,
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const submissionsWithDetails = submissions.map((submission) => {
      const totalQuestions = submission.exerciseList.questions.length;
      const correctAnswers = Math.round(
        (submission.score / 100) * totalQuestions
      );

      return {
        id: submission.id,
        score: submission.score,
        totalQuestions,
        correctAnswers,
        createdAt: submission.createdAt,
        exerciseList: {
          id: submission.exerciseList.id,
          title: submission.exerciseList.title,
          description: submission.exerciseList.description,
          shareCode: submission.exerciseList.shareCode,
          teacher: submission.exerciseList.teacher,
          questionCount: totalQuestions,
        },
      };
    });

    return NextResponse.json({ submissions: submissionsWithDetails });
  } catch (error) {
    return handleApiError(error);
  }
}
