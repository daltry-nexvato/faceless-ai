"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StyleTemplateMeta, StyleTemplateId } from "@/lib/types/styles";

interface TemplatePickerProps {
  templates: StyleTemplateMeta[];
  onSelect: (templateId: StyleTemplateId) => void;
  isLoading: boolean;
}

const TEMPLATE_COLORS: Record<StyleTemplateId, string> = {
  true_crime: "border-red-500/30 hover:border-red-500",
  educational: "border-blue-500/30 hover:border-blue-500",
  finance: "border-emerald-500/30 hover:border-emerald-500",
  tech_review: "border-purple-500/30 hover:border-purple-500",
  gaming: "border-green-500/30 hover:border-green-500",
  cooking: "border-amber-500/30 hover:border-amber-500",
  travel: "border-yellow-500/30 hover:border-yellow-500",
  health_fitness: "border-lime-500/30 hover:border-lime-500",
  story_commentary: "border-orange-500/30 hover:border-orange-500",
  shorts_viral: "border-pink-500/30 hover:border-pink-500",
};

const TEMPLATE_SELECTED: Record<StyleTemplateId, string> = {
  true_crime: "border-red-500 bg-red-50",
  educational: "border-blue-500 bg-blue-50",
  finance: "border-emerald-500 bg-emerald-50",
  tech_review: "border-purple-500 bg-purple-50",
  gaming: "border-green-500 bg-green-50",
  cooking: "border-amber-500 bg-amber-50",
  travel: "border-yellow-500 bg-yellow-50",
  health_fitness: "border-lime-500 bg-lime-50",
  story_commentary: "border-orange-500 bg-orange-50",
  shorts_viral: "border-pink-500 bg-pink-50",
};

export function TemplatePicker({ templates, onSelect, isLoading }: TemplatePickerProps) {
  const [selected, setSelected] = useState<StyleTemplateId | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Choose a Style Template</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Pick a starting template for your channel&apos;s creative style. You can customize everything after.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const isSelected = selected === template.id;
          return (
            <Card
              key={template.id}
              className={cn(
                "cursor-pointer border-2 transition-all",
                isSelected
                  ? TEMPLATE_SELECTED[template.id]
                  : TEMPLATE_COLORS[template.id]
              )}
              onClick={() => setSelected(template.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-zinc-900">{template.name}</h3>
                  {isSelected && (
                    <Badge className="bg-zinc-900 text-white text-[10px]">Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-1">{template.description}</p>
                <p className="text-[10px] text-zinc-400 mt-2">Niche: {template.niche}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected || isLoading}
        >
          {isLoading ? "Creating Style..." : "Create Style from Template"}
        </Button>
      </div>

      <p className="text-xs text-zinc-400 text-center">
        Templates are free. AI-generated styles from reference channels cost 75 credits (available after Research Board is built).
      </p>
    </div>
  );
}
