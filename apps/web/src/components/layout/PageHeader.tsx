import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  align?: "center" | "start";
  animationDelay?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className = "",
  align = "center",
  animationDelay = "0s",
}: PageHeaderProps) {
  const alignClass =
    align === "start"
      ? "items-start text-left"
      : "items-center text-center sm:text-left";

  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div
        className={cn("opacity-0 animate-fade-up", alignClass)}
        style={{ animationDelay }}
      >
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-2 text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>

      {actions && (
        <div
          className="opacity-0 animate-fade-up w-full sm:w-auto shrink-0"
          style={{ animationDelay }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
