import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  icon: LucideIcon;
  value: ReactNode;
  label: string;
  colorClass?: string;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  colorClass = "primary",
}: StatCardProps) {
  return (
    <div className="glass-card rounded-lg p-3 flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${colorClass}/10 flex-shrink-0`}
      >
        <Icon className={`h-5 w-5 text-${colorClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
