import React, { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "", style }, ref) => {
    return (
      <div
        ref={ref}
        className={`hover-lift glass-card rounded-lg ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`p-6 pb-3 ${className}`}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CardTitle({ children, className = "", style }: CardTitleProps) {
  return (
    <h3
      className={cn("text-lg font-semibold text-foreground", className)}
      style={style}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({
  children,
  className = "",
}: CardDescriptionProps) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`p-6 pt-3 ${className}`}>{children}</div>;
}
