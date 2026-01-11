"use client";

import React, { SVGProps } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";

interface RoleCardProps {
  id: string;
  value: string;
  selected: boolean;
  Icon: React.ComponentType<SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}

export function RoleCard({
  id,
  value,
  selected,
  Icon,
  children,
}: RoleCardProps) {
  return (
    <div className="relative flex">
      <RadioGroupItem value={value} id={id} className="peer sr-only" />
      <Label
        htmlFor={id}
        className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-all h-[100px] w-full ${
          selected
            ? "border-primary bg-primary/5"
            : "border-muted bg-background hover:bg-accent hover:text-white"
        }`}
      >
        <Icon className={`h-6 w-6 mb-2 ${selected ? "text-primary" : ""}`} />
        <span
          className={`text-sm font-medium ${selected ? "text-primary" : ""}`}
        >
          {children}
        </span>
      </Label>
    </div>
  );
}
