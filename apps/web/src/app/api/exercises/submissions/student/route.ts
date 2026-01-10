import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@teachy/firebase/admin";
import { prisma, UserRole } from "@teachy/db";

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

    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { error: "Forbidden: Only students can access this resource" },
        { status: 403 }
      );
    }

    const submissions = await prisma.submission.findMany({
      where: { studentId: user.id },
      include: {
        exerciseList: {
          include: {
            questions: true,
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const submissionsWithDetails = submissions.map((submission) => {
      const totalQuestions = submission.exerciseList.questions.length;
      const correctAnswers = Math.round(
        (submission.score / 100) * totalQuestions
      );

      return {
        id: submission.id,
        score: submission.score,
        totalQuestions,
        correctAnswers,
        createdAt: submission.createdAt,
        exerciseList: {
          id: submission.exerciseList.id,
          title: submission.exerciseList.title,
          description: submission.exerciseList.description,
          shareCode: submission.exerciseList.shareCode,
          teacher: submission.exerciseList.teacher,
          questionCount: totalQuestions,
        },
      };
    });

    return NextResponse.json({ submissions: submissionsWithDetails });
  } catch (error) {
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.error("Error fetching student submissions:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
