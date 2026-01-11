import { NextRequest, NextResponse } from "next/server";
import { prisma, QuestionType } from "@teachy/db";
import { z } from "zod";
import { generateShareCode } from "@/lib/utils/exercise";
import { requireTeacher, handleApiError } from "@/lib/api/server";

const createListSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  questions: z.array(
    z.object({
      title: z.string().min(1, "Question title is required"),
      type: z.nativeEnum(QuestionType),
      options: z
        .array(
          z.object({
            label: z.string().min(1, "Option label is required"),
            isCorrect: z.boolean(),
          })
        )
        .optional(),
      order: z.number(),
    })
  ),
});

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireTeacher(request);

    const lists = await prisma.exerciseList.findMany({
      where: { teacherId: user.id },
      include: {
        questions: true,
        submissions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ lists });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireTeacher(request);

    const body = await request.json();
    const validatedData = createListSchema.parse(body);

    let shareCode = generateShareCode();
    let codeExists = true;
    while (codeExists) {
      const existing = await prisma.exerciseList.findUnique({
        where: { shareCode },
      });
      if (!existing) {
        codeExists = false;
      } else {
        shareCode = generateShareCode();
      }
    }

    const exerciseList = await prisma.exerciseList.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        shareCode,
        teacherId: user.id,
        questions: {
          create: validatedData.questions.map((q) => ({
            title: q.title,
            type: q.type as QuestionType,
            order: q.order,
            ...(q.type === QuestionType.MULTIPLE_CHOICE &&
            q.options &&
            q.options.length > 0
              ? {
                  options: {
                    create: q.options.map((opt) => ({
                      label: opt.label,
                      isCorrect: opt.isCorrect,
                    })),
                  },
                }
              : {}),
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json({ list: exerciseList });
  } catch (error) {
    return handleApiError(error);
  }
}
