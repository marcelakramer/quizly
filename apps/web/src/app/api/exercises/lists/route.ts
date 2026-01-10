import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@teachy/firebase/admin";
import { prisma, QuestionType } from "@teachy/db";
import { z } from "zod";
import { generateShareCode } from "@/lib/utils/exercise";

const createListSchema = z.object({
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

export async function GET(request: NextRequest) {
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
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.error("Error fetching exercise lists:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

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

    if (user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Forbidden: Only teachers can create exercise lists" },
        { status: 403 }
      );
    }

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

    return NextResponse.json({ list: exerciseList });
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

    console.error("Error creating exercise list:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
