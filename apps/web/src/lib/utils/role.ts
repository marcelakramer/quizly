import { UserRole } from "@teachy/db";

/**
 * Get the dashboard path based on user role
 * @param role - The user's role (TEACHER or STUDENT)
 * @returns The dashboard path for the given role
 */
export function getDashboardPathForRole(role?: UserRole | string) {
  if (!role) return "/";
  if (role === UserRole.TEACHER || role === "TEACHER")
    return "/teacher/dashboard";
  return "/student/dashboard";
}

/**
 * Check if a role is a teacher role
 * @param role - The user's role to check
 * @returns True if the role is TEACHER, false otherwise
 */
export function isRoleTeacher(role?: UserRole | string) {
  return role === UserRole.TEACHER || role === "TEACHER";
}
