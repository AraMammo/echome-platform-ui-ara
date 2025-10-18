"use client";

import React, { useState } from "react";
import { Card } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Trash2, Edit2, Save, X } from "lucide-react";
import { useGenerationStore, ContentPreset } from "@/stores/generation-store";

export function PresetManager() {
  const { presets, deletePreset, updatePreset } = useGenerationStore();
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleStartEdit = (preset: ContentPreset) => {
    setEditingPreset(preset.id);
    setEditName(preset.name);
  };

  const handleSaveEdit = (presetId: string) => {
    if (editName.trim()) {
      updatePreset(presetId, { name: editName.trim() });
      setEditingPreset(null);
      setEditName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingPreset(null);
    setEditName("");
  };

  const handleDelete = (presetId: string, presetName: string) => {
    if (
      confirm(
        `Are you sure you want to delete the preset "${presetName}"? This cannot be undone.`
      )
    ) {
      deletePreset(presetId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium text-zinc-900">
            Generation Presets
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Manage your saved audience and format configurations
          </p>
        </div>
      </div>

      {presets.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-sm text-stone-500 mb-2">
            No presets saved yet
          </div>
          <p className="text-xs text-stone-400">
            Create presets in the generation flow to save your audience and
            format configurations for future use
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {presets.map((preset) => (
            <Card key={preset.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingPreset === preset.id ? (
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 h-9 px-3 bg-stone-50 rounded-[8px] border border-stone-200 focus:border-[#3a8e9c] focus:ring-2 focus:ring-[#3a8e9c]/20 outline-none text-sm"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit(preset.id);
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(preset.id)}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <h3 className="text-lg font-medium text-zinc-900 mb-3">
                      {preset.name}
                    </h3>
                  )}

                  {/* Audience Details */}
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">Audience:</span>{" "}
                      {preset.audience.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <span className="font-medium">Tone:</span>
                      <Badge variant="outline" className="text-xs">
                        {preset.audience.tone}
                      </Badge>
                      <span className="font-medium">Style:</span>
                      <Badge variant="outline" className="text-xs">
                        {preset.audience.style}
                      </Badge>
                    </div>
                  </div>

                  {/* Formats */}
                  <div className="mb-3">
                    <div className="text-sm font-medium text-zinc-900 mb-2">
                      Formats ({preset.formats.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preset.formats.map((format) => (
                        <Badge
                          key={format}
                          variant="outline"
                          className="text-xs bg-[#3a8e9c]/10 border-[#3a8e9c]/30 text-[#3a8e9c]"
                        >
                          {format.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-stone-500">
                    Created {formatDate(preset.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(preset)}
                    disabled={editingPreset === preset.id}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(preset.id, preset.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-stone-50 rounded-[12px] border border-stone-200">
        <h3 className="text-sm font-medium text-zinc-900 mb-2">
          How to use presets
        </h3>
        <ul className="text-xs text-stone-600 space-y-1">
          <li>
            • Create presets in the generation flow by clicking &quot;Save as
            Preset&quot; on the Audience step
          </li>
          <li>
            • Load presets to quickly apply saved audience and format
            configurations
          </li>
          <li>• Edit preset names here or delete presets you no longer need</li>
        </ul>
      </div>
    </div>
  );
}
