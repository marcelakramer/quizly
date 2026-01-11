"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText?: string;
  buttonAction?: () => void;
  buttonHref?: string;
  buttonIcon?: LucideIcon;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonAction,
  buttonHref,
  buttonIcon: ButtonIcon,
  className,
}: EmptyStateProps) {
  const buttonContent =
    ButtonIcon && buttonText ? (
      <>
        <ButtonIcon className="mr-2 h-4 w-4" />
        {buttonText}
      </>
    ) : (
      buttonText
    );

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center opacity-0 animate-fade-up",
        className
      )}
    >
      <Icon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted-foreground max-w-sm">{description}</p>
      {buttonText && (buttonAction || buttonHref) && (
        <div className="mt-6">
          {buttonHref ? (
            <Button asChild size="lg">
              <Link href={buttonHref}>{buttonContent}</Link>
            </Button>
          ) : (
            <Button onClick={buttonAction} size="lg">
              {buttonContent}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
