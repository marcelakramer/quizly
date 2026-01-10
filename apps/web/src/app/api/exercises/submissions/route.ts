import { NextRequest, NextResponse } from "next/server";
import { prisma, UserRole } from "@teachy/db";
import { getAdminAuth } from "@teachy/firebase/admin";
import { z } from "zod";

const submitSchema = z.object({
  shareCode: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionId: z.string(),
    })
  ),
});

export async function POST(request: NextRequest) {
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
        { error: "Only students can submit quizzes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = submitSchema.parse(body);

    const exerciseList = await prisma.exerciseList.findUnique({
      where: { shareCode: validatedData.shareCode },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!exerciseList) {
      return NextResponse.json(
        { error: "Exercise list not found" },
        { status: 404 }
      );
    }

    const correctAnswers = exerciseList.questions.reduce((acc, question) => {
      const correctOption = question.options.find((opt) => opt.isCorrect);
      const studentAnswer = validatedData.answers.find(
        (a) => a.questionId === question.id
      );

      if (
        correctOption &&
        studentAnswer?.selectedOptionId === correctOption.id
      ) {
        return acc + 1;
      }
      return acc;
    }, 0);

    const score = (correctAnswers / exerciseList.questions.length) * 100;

    const existingSubmission = await prisma.submission.findUnique({
      where: {
        exerciseListId_studentId: {
          exerciseListId: exerciseList.id,
          studentId: user.id,
        },
      },
    });

    let submission;
    if (existingSubmission) {
      await prisma.answer.deleteMany({
        where: { submissionId: existingSubmission.id },
      });

      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          score,
          answers: {
            create: validatedData.answers.map((answer) => ({
              questionId: answer.questionId,
              selectedOptionId: answer.selectedOptionId,
            })),
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
    } else {
      submission = await prisma.submission.create({
        data: {
          exerciseListId: exerciseList.id,
          studentId: user.id,
          score,
          answers: {
            create: validatedData.answers.map((answer) => ({
              questionId: answer.questionId,
              selectedOptionId: answer.selectedOptionId,
            })),
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
    }

    return NextResponse.json({
      submission: {
        id: submission.id,
        score: submission.score,
        totalQuestions: exerciseList.questions.length,
        correctAnswers,
        answers: submission.answers.map((answer) => ({
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect:
            answer.question.options.find(
              (opt) => opt.id === answer.selectedOptionId
            )?.isCorrect || false,
          correctOptionId: answer.question.options.find((opt) => opt.isCorrect)
            ?.id,
        })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
