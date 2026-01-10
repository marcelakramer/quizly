export function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
