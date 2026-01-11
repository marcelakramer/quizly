import { ReactNode } from "react";

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
  const alignClass = align === "start" ? "items-start" : "items-center";

  return (
    <div className={`mb-8 flex ${alignClass} justify-between ${className}`}>
      <div className="opacity-0 animate-fade-up" style={{ animationDelay }}>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div
          className="opacity-0 animate-fade-up shrink-0"
          style={{ animationDelay }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
