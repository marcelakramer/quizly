import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  rows?: number;
  autoGrow?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 3, autoGrow = false, value, ...props }, ref) => {
    const localRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useImperativeHandle(
      ref,
      () => localRef.current as HTMLTextAreaElement
    );

    React.useLayoutEffect(() => {
      if (!autoGrow) return;
      const el = localRef.current;
      if (!el) return;
      el.style.overflow = "hidden";
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [value, autoGrow]);

    return (
      <textarea
        ref={localRef}
        rows={rows}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden",
          className
        )}
        value={value}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
