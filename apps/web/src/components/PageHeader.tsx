import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-8 flex items-center justify-between ${className}`}>
      <div className="opacity-0 animate-fade-up">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div
          className="opacity-0 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
