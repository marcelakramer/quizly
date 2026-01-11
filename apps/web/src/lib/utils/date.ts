/**
 * Format a date with full month name, day, year, and time
 * Example: "January 11, 2026, 02:30 PM"
 */
export function formatDateTimeLong(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a date with short month name, day, and year
 * Example: "Jan 11, 2026"
 */
export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date using default locale
 * Example: "1/11/2026"
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString();
}

/**
 * Format time only
 * Example: "02:30 PM"
 */
export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
