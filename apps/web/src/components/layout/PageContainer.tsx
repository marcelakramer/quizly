import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <div className="min-h-full bg-background">
      <main className={`container py-8 ${className}`}>{children}</main>
    </div>
  );
}
