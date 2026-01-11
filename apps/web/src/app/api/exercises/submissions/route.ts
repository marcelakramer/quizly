import { NextRequest, NextResponse } from "next/server";
import { prisma, QuestionType } from "@teachy/db";
import { z } from "zod";
import { requireStudent } from "@/lib/api/auth";
import { handleApiError, notFound } from "@/lib/api/server/errors";

const submitSchema = z.object({
  shareCode: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionId: z.string().optional(),
      textAnswer: z.string().optional(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireStudent(request);

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
      throw notFound("Exercise list not found");
    }

    // Count all questions for scoring
    const totalQuestions = exerciseList.questions.length;

    const correctAnswers = exerciseList.questions.reduce((acc, question) => {
      // Open-ended questions are always considered correct
      if (question.type === QuestionType.OPEN_ENDED) {
        return acc + 1;
      }

      // For multiple choice, check if the selected option is correct
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

    // Score is based on all questions
    const score =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

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
            create: validatedData.answers.map((answer) => {
              const question = exerciseList.questions.find(
                (q) => q.id === answer.questionId
              );
              const isOpenEnded = question?.type === QuestionType.OPEN_ENDED;

              const baseAnswer: {
                questionId: string;
                selectedOptionId: string | null;
                textAnswer: string | null;
              } = {
                questionId: answer.questionId,
                selectedOptionId: null,
                textAnswer: null,
              };

              if (isOpenEnded) {
                baseAnswer.textAnswer = answer.textAnswer || null;
              } else {
                baseAnswer.selectedOptionId = answer.selectedOptionId || null;
              }

              return baseAnswer;
            }),
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
            create: validatedData.answers.map((answer) => {
              const question = exerciseList.questions.find(
                (q) => q.id === answer.questionId
              );
              const isOpenEnded = question?.type === QuestionType.OPEN_ENDED;

              const baseAnswer: {
                questionId: string;
                selectedOptionId: string | null;
                textAnswer: string | null;
              } = {
                questionId: answer.questionId,
                selectedOptionId: null,
                textAnswer: null,
              };

              if (isOpenEnded) {
                baseAnswer.textAnswer = answer.textAnswer || null;
              } else {
                baseAnswer.selectedOptionId = answer.selectedOptionId || null;
              }

              return baseAnswer;
            }),
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
        totalQuestions,
        correctAnswers,
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
              : question?.options.find((opt) => opt.isCorrect)?.id,
          };
        }),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
