import { NextRequest } from "next/server";
import { prisma, UserRole } from "@teachy/db";
import { getAdminAuth } from "@teachy/firebase/admin";
import { unauthorized, notFound, forbidden } from "./errors";

export async function getAuthToken(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw unauthorized();
  }
  return authHeader.substring(7);
}

export async function verifyToken(idToken: string) {
  const adminAuth = getAdminAuth();
  const decodedToken = await adminAuth.verifyIdToken(idToken);

  if (!decodedToken.email) {
    throw unauthorized("Email not found in token");
  }

  return decodedToken;
}

export async function getCurrentUser(request: NextRequest) {
  const idToken = await getAuthToken(request);
  const { email, name } = await verifyToken(idToken);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw notFound("User not found");
  }

  return { user, email: email!, name };
}

export async function requireTeacher(request: NextRequest) {
  const { user, email, name } = await getCurrentUser(request);

  if (user.role !== UserRole.TEACHER) {
    throw forbidden("Only teachers can access this resource");
  }

  return { user, email, name };
}

export async function requireStudent(request: NextRequest) {
  const { user, email, name } = await getCurrentUser(request);

  if (user.role !== UserRole.STUDENT) {
    throw forbidden("Only students can access this resource");
  }

  return { user, email, name };
}
