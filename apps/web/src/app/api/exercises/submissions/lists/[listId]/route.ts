import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@teachy/firebase/admin";
import { prisma, UserRole } from "@teachy/db";

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

    if (user.role !== UserRole.TEACHER) {
      return NextResponse.json(
        { error: "Forbidden: Only teachers can access this resource" },
        { status: 403 }
      );
    }

    const { listId } = params;

    const exerciseList = await prisma.exerciseList.findUnique({
      where: { id: listId },
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

    if (exerciseList.teacherId !== user.id) {
      return NextResponse.json(
        {
          error:
            "Forbidden: You can only view results for your own exercise lists",
        },
        { status: 403 }
      );
    }

    const submissions = await prisma.submission.findMany({
      where: { exerciseListId: listId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const submissionsWithScore = submissions.map((submission) => {
      const totalQuestions = exerciseList.questions.length;
      const correctAnswers = Math.round(
        (submission.score / 100) * totalQuestions
      );

      return {
        id: submission.id,
        studentName: submission.student.name,
        studentEmail: submission.student.email,
        score: correctAnswers,
        totalQuestions,
        percentage: submission.score,
        submittedAt: submission.createdAt,
      };
    });

    return NextResponse.json({
      list: {
        id: exerciseList.id,
        title: exerciseList.title,
        description: exerciseList.description,
        shareCode: exerciseList.shareCode,
        questions: exerciseList.questions,
      },
      submissions: submissionsWithScore,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
