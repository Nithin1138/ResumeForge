"use client";

export interface CustomTag {
  id: string;
  name: string;
  color: string;
  dot: string;
  paletteId: string;
}

export const COLOR_PALETTES = [
  { id: "emerald", label: "Emerald Green", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500" },
  { id: "rose", label: "Rose Red", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30", dot: "bg-rose-500" },
  { id: "purple", label: "Purple", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30", dot: "bg-purple-500" },
  { id: "sky", label: "Sky Blue", color: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30", dot: "bg-sky-500" },
  { id: "amber", label: "Amber Orange", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30", dot: "bg-amber-500" },
  { id: "teal", label: "Teal", color: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30", dot: "bg-teal-500" },
  { id: "indigo", label: "Indigo", color: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30", dot: "bg-indigo-500" },
  { id: "pink", label: "Pink", color: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30", dot: "bg-pink-500" },
];

const TAGS_STORAGE_KEY = "atslift_custom_tags";

export function getCustomTags(): CustomTag[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TAGS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomTags(tags: CustomTag[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  } catch (e) {
    console.error("Failed to save custom tags:", e);
  }
}

export function addCustomTag(name: string, paletteId: string): CustomTag {
  const palette = COLOR_PALETTES.find((p) => p.id === paletteId) || COLOR_PALETTES[0];
  const newTag: CustomTag = {
    id: "tag_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    color: palette.color,
    dot: palette.dot,
    paletteId: palette.id,
  };

  const existing = getCustomTags();
  const updated = [...existing, newTag];
  saveCustomTags(updated);
  return newTag;
}

export function updateCustomTag(id: string, name: string, paletteId: string): CustomTag[] {
  const palette = COLOR_PALETTES.find((p) => p.id === paletteId) || COLOR_PALETTES[0];
  const existing = getCustomTags();
  const updated = existing.map((t) =>
    t.id === id
      ? {
          ...t,
          name: name.trim(),
          color: palette.color,
          dot: palette.dot,
          paletteId: palette.id,
        }
      : t
  );
  saveCustomTags(updated);
  return updated;
}

export function deleteCustomTag(id: string): CustomTag[] {
  const existing = getCustomTags();
  const updated = existing.filter((t) => t.id !== id);
  saveCustomTags(updated);
  return updated;
}
