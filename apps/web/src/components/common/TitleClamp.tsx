"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

interface TitleClampProps {
  title: string;
  lines?: number;
}

export function TitleClamp({ title, lines = 3 }: TitleClampProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    requestAnimationFrame(() => {
      const isOverflowing = el.scrollHeight > el.clientHeight + 1;
      setShowToggle(isOverflowing);
    });
  }, [title, lines]);

  const clampStyle: React.CSSProperties = expanded
    ? {}
    : {
        display: "-webkit-box",
        WebkitLineClamp: lines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      };

  return (
    <div>
      <p
        ref={ref}
        className="min-w-0 overflow-hidden break-all whitespace-pre-wrap"
        style={clampStyle}
      >
        {title}
      </p>
      {showToggle && (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setExpanded((s) => !s)}
          className="text-sm text-primary mt-1"
        >
          {expanded ? "See less" : "See more"}
        </Button>
      )}
    </div>
  );
}
