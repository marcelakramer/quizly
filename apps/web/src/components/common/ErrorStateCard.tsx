"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface ErrorStateCardProps {
  icon: LucideIcon;
  title: string;
  message: string;
  iconBg?: string;
  iconColor?: string;
  onBack: () => void;
  backLabel?: string;
  fullScreen?: boolean;
}

export function ErrorStateCard({
  icon: Icon,
  title,
  message,
  iconBg = "bg-muted/50",
  iconColor = "text-muted-foreground",
  onBack,
  backLabel = "Go Back",
  fullScreen = true,
}: ErrorStateCardProps) {
  const wrapperClass = fullScreen
    ? "min-h-screen bg-background flex items-center justify-center p-4"
    : "flex-1 bg-background flex items-center justify-center p-4";

  return (
    <div className={wrapperClass}>
      <Card className="glass-card max-w-md w-full opacity-0 animate-scale-in">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full ${iconBg}`}
              >
                <Icon className={`h-10 w-10 ${iconColor}`} />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <Button variant="outline" onClick={onBack} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
