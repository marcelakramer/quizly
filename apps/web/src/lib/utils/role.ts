import { UserRole } from "@teachy/db";

export function getDashboardPathForRole(role?: UserRole | string) {
  if (!role) return "/";
  if (role === UserRole.TEACHER || role === "TEACHER")
    return "/teacher/dashboard";
  return "/student/dashboard";
}

export function isRoleTeacher(role?: UserRole | string) {
  return role === UserRole.TEACHER || role === "TEACHER";
}
