"use client";

import { useCountUp } from "@/hooks/use-count-up";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  delay = 0,
  decimals = 0,
  suffix = "",
  className,
}: AnimatedNumberProps) {
  const animatedValue = useCountUp({
    end: value,
    duration,
    delay,
    decimals,
    suffix,
  });

  return <span className={className}>{animatedValue}</span>;
}
