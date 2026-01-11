import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass?: string;
  animationDelay?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  colorClass = "primary",
  animationDelay,
}: FeatureCardProps) {
  return (
    <div
      className="glass-card hover-lift rounded-lg p-6 opacity-0 animate-fade-up"
      style={animationDelay ? { animationDelay } : undefined}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${colorClass}/10 mb-4`}
      >
        <Icon className={`h-6 w-6 text-${colorClass}`} />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
