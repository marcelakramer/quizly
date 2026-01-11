"use client";

import { useEffect, useRef, useState } from "react";

interface TitleClampProps {
  title: string;
  lines?: number;
}

export default function TitleClamp({ title, lines = 3 }: TitleClampProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // allow layout to settle
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
        className="font-medium whitespace-pre-wrap break-words"
        style={clampStyle}
      >
        {title}
      </p>
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((s) => !s)}
          className="text-sm text-primary hover:underline mt-1"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}
