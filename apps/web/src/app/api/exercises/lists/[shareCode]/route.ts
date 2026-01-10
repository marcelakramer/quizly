import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@teachy/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { shareCode: string } }
) {
  try {
    const { shareCode } = params;

    const exerciseList = await prisma.exerciseList.findUnique({
      where: { shareCode },
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
    });

    if (!exerciseList) {
      return NextResponse.json(
        { error: "Exercise list not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ list: exerciseList });
  } catch (error) {
    console.error("Error fetching exercise list:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
