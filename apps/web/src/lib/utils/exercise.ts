/**
 * Generate a random 6-character share code for exercise lists
 * Uses uppercase letters (excluding I, O) and numbers (excluding 0, 1) for readability
 * @returns A 6-character alphanumeric share code
 */
export function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get the color class for a score based on percentage
 * @param percentage - The score percentage (0-100)
 * @returns Tailwind color class for the score
 */
export function getScoreColorClass(percentage: number): string {
  if (percentage >= 70) return "text-success";
  if (percentage >= 50) return "text-accent";
  return "text-destructive";
}

/**
 * Get a motivational message based on quiz score percentage
 * @param percentage - The score percentage (0-100)
 * @returns Object containing emoji, title, and message for the result
 */
export function getResultMessage(percentage: number): {
  emoji: string;
  title: string;
  message: string;
} {
  if (percentage >= 90) {
    return {
      emoji: "🏆",
      title: "Outstanding!",
      message: "Exceptional work! You've mastered this material.",
    };
  } else if (percentage >= 80) {
    return {
      emoji: "🎉",
      title: "Excellent!",
      message: "Great job! You have a strong understanding of the content.",
    };
  } else if (percentage >= 70) {
    return {
      emoji: "👍",
      title: "Well done!",
      message: "Good work! You're on the right track.",
    };
  } else if (percentage >= 60) {
    return {
      emoji: "💪",
      title: "Keep going!",
      message: "Not bad! Review the material and try again.",
    };
  } else if (percentage >= 50) {
    return {
      emoji: "📚",
      title: "Keep learning!",
      message: "You're making progress. Study more and you'll improve!",
    };
  } else {
    return {
      emoji: "📖",
      title: "Don't give up!",
      message: "Review the material and try again. You can do it!",
    };
  }
}
