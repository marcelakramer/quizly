import { NextRequest, NextResponse } from "next/server";
import { prisma, UserRole, QuestionType } from "@teachy/db";
import {
  getCurrentUser,
  notFound,
  forbidden,
  handleApiError,
} from "@/lib/api/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const { user } = await getCurrentUser(request);
    const { submissionId } = params;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        exerciseList: {
          include: {
            teacher: {
              select: { id: true, name: true, email: true },
            },
            questions: {
              include: { options: true },
              orderBy: { order: "asc" },
            },
          },
        },
        answers: {
          include: {
            question: { include: { options: true } },
            selectedOption: true,
          },
        },
      },
    });

    if (!submission) {
      throw notFound("Submission not found");
    }

    if (user.role === UserRole.STUDENT && submission.studentId !== user.id) {
      throw forbidden("You can only view your own submissions");
    }

    if (
      user.role === UserRole.TEACHER &&
      submission.exerciseList.teacherId !== user.id
    ) {
      throw forbidden(
        "You can only view submissions for your own exercise lists"
      );
    }

    const totalQuestions = submission.exerciseList.questions.length;
    const correctAnswers = submission.answers.reduce((acc, answer) => {
      const question = submission.exerciseList.questions.find(
        (q) => q.id === answer.questionId
      );
      if (question?.type === QuestionType.OPEN_ENDED) return acc + 1;
      if (answer.selectedOption?.isCorrect) return acc + 1;
      return acc;
    }, 0);

    return NextResponse.json({
      submission: {
        id: submission.id,
        score: submission.score,
        totalQuestions,
        correctAnswers,
        createdAt: submission.createdAt,
        student: submission.student,
        exerciseList: {
          id: submission.exerciseList.id,
          title: submission.exerciseList.title,
          description: submission.exerciseList.description,
          shareCode: submission.exerciseList.shareCode,
          teacher: submission.exerciseList.teacher,
          questions: submission.exerciseList.questions.map((q) => ({
            id: q.id,
            title: q.title,
            type: q.type,
            order: q.order,
            options: q.options,
          })),
        },
        answers: submission.answers.map((answer) => {
          const question = submission.exerciseList.questions.find(
            (q) => q.id === answer.questionId
          );
          const isOpenEnded = question?.type === QuestionType.OPEN_ENDED;

          return {
            questionId: answer.questionId,
            question: {
              id: answer.question.id,
              title: answer.question.title,
              type: answer.question.type,
              order: answer.question.order,
              options: answer.question.options,
            },
            selectedOptionId: answer.selectedOptionId || undefined,
            selectedOption: answer.selectedOption
              ? {
                  id: answer.selectedOption.id,
                  label: answer.selectedOption.label,
                  isCorrect: answer.selectedOption.isCorrect,
                }
              : undefined,
            textAnswer: answer.textAnswer || undefined,
            isCorrect: isOpenEnded
              ? true
              : answer.selectedOption?.isCorrect || false,
            correctOptionId: isOpenEnded
              ? undefined
              : answer.question.options.find((opt) => opt.isCorrect)?.id || "",
          };
        }),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
