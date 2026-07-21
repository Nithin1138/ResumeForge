"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Check, Tag as TagIcon, X, Loader2, Edit2, Trash2, Palette } from "lucide-react";
import { 
  CustomTag, 
  COLOR_PALETTES, 
  getCustomTags, 
  addCustomTag, 
  updateCustomTag, 
  deleteCustomTag 
} from "@/lib/userTags";

interface TagSelectorProps {
  currentTag?: string | null;
  onSelectTag: (newTagId: string | null) => Promise<void>;
  onTagsChanged?: () => void;
}

export default function TagSelector({ currentTag, onSelectTag, onTagsChanged }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState<CustomTag[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal / Form state for Creating or Editing a tag
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagName, setTagName] = useState("");
  const [selectedPalette, setSelectedPalette] = useState("emerald");

  const menuRef = useRef<HTMLDivElement>(null);

  const loadTags = () => {
    setTags(getCustomTags());
  };

  useEffect(() => {
    loadTags();
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFormOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeTag = tags.find((t) => t.id === currentTag || t.name === currentTag);

  const handleSelect = async (tagId: string | null) => {
    setLoading(true);
    await onSelectTag(tagId);
    setLoading(false);
    setIsOpen(false);
  };

  const handleOpenCreate = () => {
    setEditingTagId(null);
    setTagName("New Tag");
    setSelectedPalette("emerald");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, tag: CustomTag) => {
    e.stopPropagation();
    setEditingTagId(tag.id);
    setTagName(tag.name);
    setSelectedPalette(tag.paletteId || "emerald");
    setIsFormOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    const updated = deleteCustomTag(tagId);
    setTags(updated);
    if (onTagsChanged) onTagsChanged();
    if (currentTag === tagId) {
      onSelectTag(null);
    }
  };

  const handleSaveTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    if (editingTagId) {
      const updated = updateCustomTag(editingTagId, tagName, selectedPalette);
      setTags(updated);
    } else {
      const newTag = addCustomTag(tagName, selectedPalette);
      setTags((prev) => [...prev, newTag]);
      handleSelect(newTag.id);
    }

    if (onTagsChanged) onTagsChanged();
    setIsFormOpen(false);
    setTagName("New Tag");
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Trigger Button */}
      {activeTag ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 py-1 rounded-full text-xs font-bold border transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs hover:opacity-90 ${activeTag.color}`}
          title="Click to change domain tag"
        >
          <span className={`w-2 h-2 rounded-full ${activeTag.dot}`} />
          <span>{activeTag.name}</span>
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin ml-1" />
          ) : (
            <TagIcon className="w-3 h-3 opacity-60 ml-0.5" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1 rounded-full border border-dashed border-border/80 hover:border-primary bg-bg-base/40 hover:bg-primary/5 text-text-muted hover:text-primary text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
          title="Categorize this output"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tag</span>
          {loading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
        </button>
      )}

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-100 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 pb-1.5 px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
              Select or Create Tag
            </span>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="text-xs font-bold text-primary hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>New Tag</span>
            </button>
          </div>

          {/* Inline Create / Edit Form */}
          {isFormOpen ? (
            <form onSubmit={handleSaveTag} className="bg-bg-base/80 p-2.5 rounded-xl border border-primary/30 space-y-2.5">
              <div className="text-xs font-bold text-text flex items-center justify-between">
                <span>{editingTagId ? "Edit Tag" : "Create New Tag"}</span>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-text-muted hover:text-text cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Type tag name here..."
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                autoFocus
                onFocus={(e) => e.target.select()}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text focus:outline-none focus:border-primary font-medium"
              />

              {/* Color Palette Picker */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-text-muted block">Choose Color:</span>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PALETTES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPalette(p.id)}
                      className={`w-5 h-5 rounded-full transition-all flex items-center justify-center cursor-pointer ${p.dot} ${
                        selectedPalette === p.id ? "ring-2 ring-text ring-offset-1 scale-110" : "opacity-60 hover:opacity-100"
                      }`}
                      title={p.label}
                    >
                      {selectedPalette === p.id && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!tagName.trim()}
                className="w-full py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
              >
                {editingTagId ? "Save Tag" : "Add Tag"}
              </button>
            </form>
          ) : (
            <>
              {/* Custom Tags List */}
              {tags.length === 0 ? (
                <div className="p-3 text-center space-y-2 bg-bg-base/40 rounded-xl border border-dashed border-border/60">
                  <p className="text-xs text-text-muted font-medium">No custom tags created yet.</p>
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create Your First Tag</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {tags.map((tag) => {
                    const isCurrent = currentTag === tag.id || currentTag === tag.name;
                    return (
                      <div
                        key={tag.id}
                        onClick={() => handleSelect(tag.id)}
                        className={`group px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-text-muted hover:text-text hover:bg-bg-base"
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${tag.dot}`} />
                          <span className="truncate">{tag.name}</span>
                        </div>

                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(e, tag)}
                            className="p-1 text-text-muted hover:text-primary transition-colors cursor-pointer"
                            title="Rename / Change Color"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, tag.id)}
                            className="p-1 text-text-muted hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete Tag"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Remove Tag option if item has a tag */}
              {currentTag && (
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className="w-full px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center space-x-2 transition-all cursor-pointer pt-2 border-t border-border/40"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove Tag From Item</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
