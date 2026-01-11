import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@teachy/firebase/admin";
import { prisma, UserRole, QuestionType } from "@teachy/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
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

    const { submissionId } = params;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exerciseList: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            questions: {
              include: {
                options: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
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
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Check permissions: students can only view their own submissions,
    // teachers can view submissions for their own exercise lists
    if (user.role === UserRole.STUDENT) {
      if (submission.studentId !== user.id) {
        return NextResponse.json(
          { error: "Forbidden: You can only view your own submissions" },
          { status: 403 }
        );
      }
    } else if (user.role === UserRole.TEACHER) {
      if (submission.exerciseList.teacherId !== user.id) {
        return NextResponse.json(
          {
            error:
              "Forbidden: You can only view submissions for your own exercise lists",
          },
          { status: 403 }
        );
      }
    }

    // Count all questions for scoring
    const totalQuestions = submission.exerciseList.questions.length;
    const correctAnswers = submission.answers.reduce((acc, answer) => {
      const question = submission.exerciseList.questions.find(
        (q) => q.id === answer.questionId
      );
      // Open-ended questions are always considered correct
      if (question?.type === QuestionType.OPEN_ENDED) {
        return acc + 1;
      }
      // For multiple choice, check if the selected option is correct
      if (answer.selectedOption && answer.selectedOption.isCorrect) {
        return acc + 1;
      }
      return acc;
    }, 0);

    return NextResponse.json({
      submission: {
        id: submission.id,
        score: submission.score,
        totalQuestions,
        correctAnswers,
        createdAt: submission.createdAt,
        student: {
          id: submission.student.id,
          name: submission.student.name,
          email: submission.student.email,
        },
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
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.error("Error fetching submission details:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
