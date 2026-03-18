"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StyleSectionCardProps {
  title: string;
  description: string;
  scoreLabel?: string;
  scoreColor?: "green" | "yellow" | "red";
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function StyleSectionCard({
  title,
  description,
  scoreLabel,
  scoreColor,
  defaultOpen = false,
  children,
}: StyleSectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const scoreColorClass =
    scoreColor === "green"
      ? "text-green-600 bg-green-50"
      : scoreColor === "yellow"
      ? "text-yellow-600 bg-yellow-50"
      : scoreColor === "red"
      ? "text-red-600 bg-red-50"
      : "text-zinc-500 bg-zinc-50";

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            )}
            <div>
              <CardTitle className="text-sm font-semibold">{title}</CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
            </div>
          </div>
          {scoreLabel && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                scoreColorClass
              )}
            >
              {scoreLabel}
            </span>
          )}
        </div>
      </CardHeader>
      {isOpen && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}
