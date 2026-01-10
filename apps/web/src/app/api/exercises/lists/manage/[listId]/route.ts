import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@teachy/firebase/admin";
import { prisma, QuestionType } from "@teachy/db";
import { z } from "zod";

const updateListSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  questions: z.array(
    z.object({
      title: z.string().min(1, "Question title is required"),
      options: z
        .array(
          z.object({
            label: z.string().min(1, "Option label is required"),
            isCorrect: z.boolean(),
          })
        )
        .min(2, "At least 2 options are required"),
      order: z.number(),
    })
  ),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { listId: string } }
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

    if (user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Forbidden: Only teachers can access this resource" },
        { status: 403 }
      );
    }

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
      return NextResponse.json(
        { error: "Exercise list not found" },
        { status: 404 }
      );
    }

    if (exerciseList.teacherId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only access your own exercise lists" },
        { status: 403 }
      );
    }

    return NextResponse.json({ list: exerciseList });
  } catch (error) {
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.error("Error fetching exercise list:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { listId: string } }
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

    if (user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Forbidden: Only teachers can update exercise lists" },
        { status: 403 }
      );
    }

    const { listId } = params;

    const exerciseList = await prisma.exerciseList.findUnique({
      where: { id: listId },
      include: {
        submissions: true,
      },
    });

    if (!exerciseList) {
      return NextResponse.json(
        { error: "Exercise list not found" },
        { status: 404 }
      );
    }

    if (exerciseList.teacherId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own exercise lists" },
        { status: 403 }
      );
    }

    if (exerciseList.submissions.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot edit exercise list that has submissions",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateListSchema.parse(body);

    // Delete all existing questions and options
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

    // Update the exercise list and create new questions
    const updatedList = await prisma.exerciseList.update({
      where: { id: listId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        questions: {
          create: validatedData.questions.map((q) => ({
            title: q.title,
            type: QuestionType.MULTIPLE_CHOICE,
            order: q.order,
            options: {
              create: q.options.map((opt) => ({
                label: opt.label,
                isCorrect: opt.isCorrect,
              })),
            },
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.error("Error updating exercise list:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { listId: string } }
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

    if (user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Forbidden: Only teachers can delete exercise lists" },
        { status: 403 }
      );
    }

    const { listId } = params;

    const exerciseList = await prisma.exerciseList.findUnique({
      where: { id: listId },
      include: {
        submissions: true,
      },
    });

    if (!exerciseList) {
      return NextResponse.json(
        { error: "Exercise list not found" },
        { status: 404 }
      );
    }

    if (exerciseList.teacherId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own exercise lists" },
        { status: 403 }
      );
    }

    // Delete the exercise list (cascade will delete questions, options, answers, and submissions)
    await prisma.exerciseList.delete({
      where: { id: listId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.error("Error deleting exercise list:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
