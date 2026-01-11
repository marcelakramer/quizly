import { NextRequest, NextResponse } from "next/server";
import { prisma, QuestionType } from "@teachy/db";
import { requireStudent, notFound, handleApiError } from "@/lib/api/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { shareCode: string } }
) {
  try {
    const { user } = await requireStudent(request);
    const { shareCode } = params;

    const exerciseList = await prisma.exerciseList.findUnique({
      where: { shareCode },
      include: { questions: true },
    });

    if (!exerciseList) {
      throw notFound("Exercise list not found");
    }

    const submission = await prisma.submission.findUnique({
      where: {
        exerciseListId_studentId: {
          exerciseListId: exerciseList.id,
          studentId: user.id,
        },
      },
      include: {
        answers: {
          include: {
            question: { include: { options: true } },
            selectedOption: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ hasSubmission: false });
    }

    const totalQuestions = exerciseList.questions.length;
    const correctAnswers = submission.answers.reduce((acc, answer) => {
      const question = exerciseList.questions.find(
        (q) => q.id === answer.questionId
      );
      if (question?.type === QuestionType.OPEN_ENDED) return acc + 1;
      if (answer.selectedOption?.isCorrect) return acc + 1;
      return acc;
    }, 0);

    return NextResponse.json({
      hasSubmission: true,
      submission: {
        id: submission.id,
        score: submission.score,
        totalQuestions,
        correctAnswers,
        createdAt: submission.createdAt,
        answers: submission.answers.map((answer) => {
          const question = exerciseList.questions.find(
            (q) => q.id === answer.questionId
          );
          const isOpenEnded = question?.type === QuestionType.OPEN_ENDED;

          return {
            questionId: answer.questionId,
            selectedOptionId: answer.selectedOptionId || undefined,
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
