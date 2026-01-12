import { LucideIcon } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface IconCardHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  colorClass?: string;
}

export function IconCardHeader({
  icon: Icon,
  title,
  description,
  colorClass = "primary",
}: IconCardHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`flex h-10 w-10 min-w-[2.5rem] flex-shrink-0 items-center justify-center rounded-lg bg-${colorClass}/10`}
        >
          <Icon className={`h-5 w-5 text-${colorClass}`} />
        </div>
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </div>
    </CardHeader>
  );
}
