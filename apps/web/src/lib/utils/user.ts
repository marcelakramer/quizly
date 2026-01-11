/**
 * Get initials from a user's name
 * @param name - The user's full name
 * @returns Two-character uppercase initials (first and last name, or first two characters)
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
