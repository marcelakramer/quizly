import { NextRequest, NextResponse } from "next/server";
import { prisma, QuestionType } from "@teachy/db";
import { z } from "zod";
import { requireTeacher } from "@/lib/api/auth";
import {
  handleApiError,
  notFound,
  forbidden,
  badRequest,
} from "@/lib/api/server/errors";

const updateListSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const { user } = await requireTeacher(request);
    const { listId } = params;

    const exerciseList = await prisma.exerciseList.findUnique({
      where: { id: listId },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        submissions: true,
      },
    });

    if (!exerciseList) {
      throw notFound("Exercise list not found");
    }

    if (exerciseList.teacherId !== user.id) {
      throw forbidden("You can only access your own exercise lists");
    }

    return NextResponse.json({ list: exerciseList });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const { user } = await requireTeacher(request);
    const { listId } = params;

    const exerciseList = await prisma.exerciseList.findUnique({
      where: { id: listId },
      include: {
        submissions: true,
      },
    });

    if (!exerciseList) {
      throw notFound("Exercise list not found");
    }

    if (exerciseList.teacherId !== user.id) {
      throw forbidden("You can only update your own exercise lists");
    }

    if (exerciseList.submissions.length > 0) {
      throw badRequest("Cannot edit exercise list that has submissions");
    }

    const body = await request.json();
    const validatedData = updateListSchema.parse(body);

    await prisma.option.deleteMany({
      where: {
        question: {
          exerciseListId: listId,
        },
      },
    });

    await prisma.question.deleteMany({
      where: {
        exerciseListId: listId,
      },
    });

    const updatedList = await prisma.exerciseList.update({
      where: { id: listId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
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

    return NextResponse.json({ list: updatedList });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const { user } = await requireTeacher(request);
    const { listId } = params;

    const exerciseList = await prisma.exerciseList.findUnique({
      where: { id: listId },
    });

    if (!exerciseList) {
      throw notFound("Exercise list not found");
    }

    if (exerciseList.teacherId !== user.id) {
      throw forbidden("You can only delete your own exercise lists");
    }

    await prisma.exerciseList.delete({
      where: { id: listId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
