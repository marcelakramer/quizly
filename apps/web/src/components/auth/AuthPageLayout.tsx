"use client";

import { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import Link from "next/link";

interface AuthHeaderProps {
  title: string;
  description: string;
}

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center">
        <Logo width={80} height={80} className="text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

interface AuthFooterLinkProps {
  text: string;
  linkText: string;
  href: string;
}

export function AuthFooterLink({ text, linkText, href }: AuthFooterLinkProps) {
  return (
    <div className="text-center text-sm">
      <span className="text-muted-foreground">{text} </span>
      <Link
        href={href}
        className="text-primary hover:text-primary/80 font-medium transition-colors ml-1"
      >
        {linkText}
      </Link>
    </div>
  );
}

interface AuthPageLayoutProps {
  children: ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 opacity-0 animate-fade-up">
        {children}
      </div>
    </div>
  );
}
