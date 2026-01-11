import { LucideIcon } from "lucide-react";

interface QuizInfoCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  colorClass?: string;
  animationDelay?: string;
}

export function QuizInfoCard({
  icon: Icon,
  value,
  label,
  colorClass = "primary",
  animationDelay,
}: QuizInfoCardProps) {
  return (
    <div
      className="glass-card rounded-lg p-6 text-center opacity-0 animate-fade-up"
      style={animationDelay ? { animationDelay } : undefined}
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-xl bg-${colorClass}/10 mx-auto mb-4`}
      >
        <Icon className={`h-8 w-8 text-${colorClass}`} />
      </div>
      <p className="text-base font-semibold text-foreground truncate">
        {value}
      </p>
      <p className="text-sm text-muted-foreground mt-2">{label}</p>
    </div>
  );
}
