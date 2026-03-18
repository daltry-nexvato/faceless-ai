"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { TemplatePicker } from "@/components/styles/template-picker";
import { StyleEditor } from "@/components/styles/style-editor";
import { Skeleton } from "@/components/ui/skeleton";
import type { Style, StyleTemplateId, StyleTemplateMeta } from "@/lib/types/styles";
import type { ApiResponse } from "@/lib/types/api";

export default function StylePage() {
  const params = useParams();
  const channelId = params.channelId as string;

  const [style, setStyle] = useState<Style | null>(null);
  const [templates, setTemplates] = useState<StyleTemplateMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);

  const fetchStyle = useCallback(async () => {
    try {
      const res = await fetch(`/api/channels/${channelId}/style`);
      const json: ApiResponse<{ style: Style | null; templates?: StyleTemplateMeta[] }> = await res.json();
      if (json.data) {
        setStyle(json.data.style);
        if (json.data.templates) setTemplates(json.data.templates);
      }
    } catch (err) {
      console.error("Failed to load style:", err);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchStyle();
  }, [fetchStyle]);

  async function handleCreateFromTemplate(templateId: StyleTemplateId) {
    setCreating(true);
    try {
      const res = await fetch(`/api/channels/${channelId}/style`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const json: ApiResponse<{ style: Style }> = await res.json();
      if (json.data) {
        setStyle(json.data.style);
      }
    } catch (err) {
      console.error("Failed to create style:", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateSection(section: string, value: unknown) {
    if (!style) return;
    try {
      const res = await fetch(`/api/channels/${channelId}/style`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, value }),
      });
      const json: ApiResponse<{ style: Style }> = await res.json();
      if (json.data) {
        setStyle(json.data.style);
      }
    } catch (err) {
      console.error("Failed to update section:", err);
    }
  }

  async function handleSaveVersion() {
    if (!style) return;
    setSavingVersion(true);
    try {
      const res = await fetch(`/api/channels/${channelId}/style/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changeSummary: "Manual save",
          userNote: null,
        }),
      });
      const json: ApiResponse<{ version: unknown }> = await res.json();
      if (json.data) {
        // Refresh to get updated version number
        await fetchStyle();
      }
    } catch (err) {
      console.error("Failed to save version:", err);
    } finally {
      setSavingVersion(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!style) {
    return (
      <TemplatePicker
        templates={templates}
        onSelect={handleCreateFromTemplate}
        isLoading={creating}
      />
    );
  }

  return (
    <StyleEditor
      style={style}
      onUpdateSection={handleUpdateSection}
      onSaveVersion={handleSaveVersion}
      isSaving={savingVersion}
    />
  );
}
