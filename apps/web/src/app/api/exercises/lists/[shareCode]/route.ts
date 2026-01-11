import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@teachy/db";
import { notFound, handleApiError } from "@/lib/api/server/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: { shareCode: string } }
) {
  try {
    const { shareCode } = params;

    const exerciseList = await prisma.exerciseList.findUnique({
      where: { shareCode },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        questions: {
          include: { options: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!exerciseList) {
      throw notFound("Exercise list not found");
    }

    return NextResponse.json({ list: exerciseList });
  } catch (error) {
    return handleApiError(error);
  }
}
