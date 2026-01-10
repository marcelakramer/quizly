import { NextRequest, NextResponse } from "next/server";
import { prisma, UserRole, QuestionType } from "@teachy/db";
import { getAdminAuth } from "@teachy/firebase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { shareCode: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.substring(7);

    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { email } = decodedToken;

    if (!email) {
      return NextResponse.json(
        { error: "Email not found in token" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { error: "Only students can check submissions" },
        { status: 403 }
      );
    }

    const { shareCode } = params;

    const exerciseList = await prisma.exerciseList.findUnique({
      where: { shareCode },
      include: {
        questions: true,
      },
    });

    if (!exerciseList) {
      return NextResponse.json(
        { error: "Exercise list not found" },
        { status: 404 }
      );
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
            question: {
              include: {
                options: true,
              },
            },
            selectedOption: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ hasSubmission: false });
    }

    // Only count multiple choice questions for scoring
    const multipleChoiceQuestions = exerciseList.questions.filter(
      (q) => q.type === QuestionType.MULTIPLE_CHOICE
    );

    const correctAnswers = submission.answers.reduce((acc, answer) => {
      if (answer.selectedOption && answer.selectedOption.isCorrect) {
        return acc + 1;
      }
      return acc;
    }, 0);

    return NextResponse.json({
      hasSubmission: true,
      submission: {
        id: submission.id,
        score: submission.score,
        totalQuestions: multipleChoiceQuestions.length,
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
              ? undefined
              : answer.selectedOption?.isCorrect || false,
            correctOptionId: isOpenEnded
              ? undefined
              : answer.question.options.find((opt) => opt.isCorrect)?.id || "",
          };
        }),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.error("Error checking submission:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
