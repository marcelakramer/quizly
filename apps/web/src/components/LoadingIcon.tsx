"use client";

interface LoadingIconProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingIcon({ size = "md", className = "" }: LoadingIconProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        className="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="32"
          className="text-primary/20"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="24"
          className="text-primary animate-spin-dash"
        />
      </svg>
    </div>
  );
}

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center ${className}`}
    >
      <LoadingIcon size="lg" />
    </div>
  );
}
