import { LucideIcon } from "lucide-react";
import { ReactNode, isValidElement } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon | ReactNode;
  value: ReactNode;
  label: string;
  colorClass?: string;
  variant?: "simple" | "card";
}

export function StatCard({
  icon,
  value,
  label,
  colorClass = "primary",
  variant = "simple",
}: StatCardProps) {
  const isRenderedElement = isValidElement(icon);
  const IconComponent = icon as LucideIcon;

  const content = (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${colorClass}/10 flex-shrink-0`}
      >
        {isRenderedElement ? (
          icon
        ) : (
          <IconComponent className={`h-5 w-5 text-${colorClass}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`${variant === "card" ? "text-2xl" : "text-lg"} font-bold text-foreground`}
        >
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );

  if (variant === "card") {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">{content}</CardContent>
      </Card>
    );
  }

  return <div className="glass-card rounded-lg p-3">{content}</div>;
}
