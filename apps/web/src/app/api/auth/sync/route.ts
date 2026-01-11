import { NextRequest, NextResponse } from "next/server";
import { prisma, UserRole } from "@teachy/db";
import { z } from "zod";
import { getAuthToken, verifyToken, handleApiError } from "@/lib/api/server";

const syncSchema = z.object({
  role: z.enum(["TEACHER", "STUDENT"]),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const idToken = await getAuthToken(request);
    const { email, name } = await verifyToken(idToken);

    const body = await request.json();
    const { role, name: providedName } = syncSchema.parse(body);

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email!,
          name: providedName || name || email!.split("@")[0],
          role: role as UserRole,
        },
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
