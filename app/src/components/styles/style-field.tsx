"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";

interface StyleFieldProps {
  label: string;
  value: string | number | boolean;
  type?: "text" | "number" | "select" | "color";
  options?: { label: string; value: string }[];
  onSave: (value: string | number | boolean) => void;
  disabled?: boolean;
}

export function StyleField({
  label,
  value,
  type = "text",
  options,
  onSave,
  disabled = false,
}: StyleFieldProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));

  function handleSave() {
    const parsed = type === "number" ? Number(editValue) : editValue;
    onSave(parsed);
    setEditing(false);
  }

  function handleCancel() {
    setEditValue(String(value));
    setEditing(false);
  }

  const displayValue =
    typeof value === "boolean"
      ? value
        ? "Yes"
        : "No"
      : String(value).replace(/_/g, " ");

  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        {!editing ? (
          <div className="flex items-center gap-2">
            {type === "color" ? (
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  className="h-5 w-5 rounded border border-zinc-300"
                  style={{ backgroundColor: String(value) }}
                />
                <span className="text-sm text-zinc-900">{String(value)}</span>
              </div>
            ) : (
              <p className="text-sm text-zinc-900 capitalize">{displayValue}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            {type === "select" && options ? (
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-sm"
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : type === "color" ? (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border border-zinc-300"
                />
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-8 w-28 text-sm"
                />
              </div>
            ) : (
              <Input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-8 max-w-[200px] text-sm"
              />
            )}
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleSave}>
              <Check className="h-3.5 w-3.5 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleCancel}>
              <X className="h-3.5 w-3.5 text-zinc-400" />
            </Button>
          </div>
        )}
      </div>
      {!editing && !disabled && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-900"
          onClick={() => {
            setEditValue(String(value));
            setEditing(true);
          }}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
