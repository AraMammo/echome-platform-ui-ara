"use client";

import React, { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Users, Target, Heart, TrendingUp, Plus, X, Sparkles } from "lucide-react";
import { useGenerationStore } from "@/stores/generation-store";
import { cn } from "@/utils/cn";
import { DEFAULT_AUDIENCE_PRESETS } from "@/config/audience-presets";

const toneOptions = [
  "Professional",
  "Casual",
  "Friendly",
  "Authoritative",
  "Conversational",
  "Formal",
  "Humorous",
  "Empathetic",
];

const styleOptions = [
  "Informative",
  "Persuasive",
  "Educational",
  "Entertaining",
  "Inspirational",
  "Analytical",
  "Storytelling",
  "Direct",
];

export function AudienceStep() {
  const {
    audience,
    setAudience,
    resetAudience,
    previousStep,
    nextStep,
    presets,
    currentPresetId,
    loadPreset,
    savePreset,
  } = useGenerationStore();

  const [painPointInput, setPainPointInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [isShowingPresets, setIsShowingPresets] = useState(false);
  const [isShowingDefaultPresets, setIsShowingDefaultPresets] = useState(true);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [selectedPresetForPreview, setSelectedPresetForPreview] = useState<string | null>(null);
  const [showCustomizeForm, setShowCustomizeForm] = useState(false);

  const handleAddPainPoint = () => {
    if (painPointInput.trim()) {
      setAudience({
        painPoints: [...audience.painPoints, painPointInput.trim()],
      });
      setPainPointInput("");
    }
  };

  const handleRemovePainPoint = (index: number) => {
    setAudience({
      painPoints: audience.painPoints.filter((_, i) => i !== index),
    });
  };

  const handleAddGoal = () => {
    if (goalInput.trim()) {
      setAudience({
        goals: [...audience.goals, goalInput.trim()],
      });
      setGoalInput("");
    }
  };

  const handleRemoveGoal = (index: number) => {
    setAudience({
      goals: audience.goals.filter((_, i) => i !== index),
    });
  };

  const handlePainPointKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPainPoint();
    }
  };

  const handleGoalKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddGoal();
    }
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim());
      setPresetName("");
      setIsSavingPreset(false);
    }
  };

  const canProceed = () => {
    return (
      audience.name.trim().length > 0 &&
      audience.tone.length > 0 &&
      audience.style.length > 0
    );
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = DEFAULT_AUDIENCE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setAudience({
        name: preset.name,
        tone: preset.tone,
        style: preset.style,
        targetDemographic: preset.targetDemographic,
        painPoints: [...preset.painPoints],
        goals: [...preset.goals],
      });
      setSelectedPresetForPreview(presetId);
      setIsShowingDefaultPresets(false);
    }
  };

  const handleContinueWithPreset = () => {
    setSelectedPresetForPreview(null);
    nextStep();
  };

  const handleCustomizePreset = () => {
    setSelectedPresetForPreview(null);
    setShowCustomizeForm(true);
  };

  const selectedPreset = selectedPresetForPreview 
    ? DEFAULT_AUDIENCE_PRESETS.find(p => p.id === selectedPresetForPreview)
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-medium text-zinc-900 mb-2">
          Define Your Audience
        </h2>
        <p className="text-stone-600">
          {selectedPreset 
            ? "Review your audience profile and continue" 
            : "Tell us who you're creating content for"}
        </p>
      </div>

      {/* Preset Preview and Quick Actions */}
      {selectedPreset && !showCustomizeForm && (
        <Card className="p-6 border-2 border-[#3a8e9c] bg-[#3a8e9c]/5">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{selectedPreset.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {selectedPreset.name}
                  </h3>
                  <p className="text-sm text-stone-600 mt-0.5">
                    {selectedPreset.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-stone-200">
              <div>
                <p className="text-xs font-medium text-stone-500 mb-2">Tone & Style</p>
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedPreset.tone}</Badge>
                  <Badge variant="outline">{selectedPreset.style}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500 mb-2">Demographics</p>
                <p className="text-xs text-stone-700 line-clamp-2">
                  {selectedPreset.targetDemographic}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-200">
              <Button
                onClick={handleContinueWithPreset}
                className="flex-1 bg-[#3a8e9c] hover:bg-[#2d7a85]"
              >
                Continue to Formats →
              </Button>
              <Button
                onClick={handleCustomizePreset}
                variant="outline"
                className="flex-1"
              >
                Customize Details
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Preset Management */}
      {!selectedPreset && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-900">
              Audience Presets
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsShowingDefaultPresets(!isShowingDefaultPresets);
                  if (!isShowingDefaultPresets) setIsShowingPresets(false);
                }}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {isShowingDefaultPresets ? "Hide" : "Quick Start"}
              </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsShowingPresets(!isShowingPresets);
                if (!isShowingPresets) setIsShowingDefaultPresets(false);
              }}
            >
              {isShowingPresets ? "Hide" : "My"} Presets
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSavingPreset(!isSavingPreset)}
            >
              Save
            </Button>
          </div>
        </div>

        {isSavingPreset && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Enter preset name..."
              className="flex-1 h-9 px-3 bg-stone-50 rounded-[8px] border border-stone-200 focus:border-[#3a8e9c] focus:ring-2 focus:ring-[#3a8e9c]/20 outline-none text-sm"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSavePreset();
                }
              }}
            />
            <Button size="sm" onClick={handleSavePreset}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsSavingPreset(false);
                setPresetName("");
              }}
            >
              Cancel
            </Button>
          </div>
        )}

          {isShowingDefaultPresets && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 mb-3">
                Choose from professionally crafted audience profiles covering diverse demographics
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEFAULT_AUDIENCE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className="p-4 rounded-[10px] border-2 border-stone-200 bg-white hover:border-[#3a8e9c] hover:shadow-sm transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl flex-shrink-0">{preset.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-zinc-900 mb-1">
                          {preset.name}
                        </div>
                        <div className="text-xs text-stone-600 mb-2 line-clamp-2">
                          {preset.description}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {preset.tone}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {preset.style}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        {isShowingPresets && (
          <div className="space-y-2">
            {presets.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-4">
                No saved presets yet
              </p>
            ) : (
              presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    loadPreset(preset.id);
                    setIsShowingPresets(false);
                  }}
                  className={cn(
                    "w-full p-3 rounded-[10px] border-2 transition-all text-left",
                    "hover:border-[#3a8e9c]",
                    currentPresetId === preset.id
                      ? "border-[#3a8e9c] bg-[#3a8e9c]/5"
                      : "border-stone-200 bg-white"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-zinc-900">
                        {preset.name}
                      </div>
                      <div className="text-xs text-stone-600 mt-1">
                        {preset.audience.name} • {preset.audience.tone} •{" "}
                        {preset.audience.style}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {preset.formats.length} formats
                    </Badge>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
        </Card>
      )}

      {/* Customization Form - Only show when user wants to customize or build from scratch */}
      {(showCustomizeForm || (!selectedPreset && !isShowingDefaultPresets)) && (
        <>
      {/* Audience Profile Name */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-stone-100 rounded-[12px] flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-[#3a8e9c]" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Audience Name
            </label>
            <input
              type="text"
              value={audience.name}
              onChange={(e) => setAudience({ name: e.target.value })}
              placeholder="e.g., Tech-savvy millennials, Small business owners, etc."
              className="w-full h-10 px-4 bg-stone-50 rounded-[10px] border border-stone-200 focus:border-[#3a8e9c] focus:ring-2 focus:ring-[#3a8e9c]/20 outline-none text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Tone Selection */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-stone-100 rounded-[12px] flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-[#3a8e9c]" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Content Tone
            </label>
            <p className="text-xs text-stone-600">
              How should your content sound?
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {toneOptions.map((tone) => (
            <button
              key={tone}
              onClick={() => setAudience({ tone })}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                audience.tone === tone
                  ? "bg-[#3a8e9c] text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              )}
            >
              {tone}
            </button>
          ))}
        </div>
      </Card>

      {/* Style Selection */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-stone-100 rounded-[12px] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-[#3a8e9c]" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Content Style
            </label>
            <p className="text-xs text-stone-600">
              What&apos;s the purpose of your content?
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {styleOptions.map((style) => (
            <button
              key={style}
              onClick={() => setAudience({ style })}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                audience.style === style
                  ? "bg-[#3a8e9c] text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </Card>

      {/* Target Demographic */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-stone-100 rounded-[12px] flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-[#3a8e9c]" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Target Demographic
            </label>
            <textarea
              value={audience.targetDemographic}
              onChange={(e) =>
                setAudience({ targetDemographic: e.target.value })
              }
              placeholder="Describe your target demographic (age, location, interests, profession, etc.)"
              className="w-full h-[80px] p-3 bg-stone-50 rounded-[10px] border border-stone-200 focus:border-[#3a8e9c] focus:ring-2 focus:ring-[#3a8e9c]/20 outline-none resize-none text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Pain Points */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-stone-100 rounded-[12px] flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-[#3a8e9c]" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Audience Pain Points
            </label>
            <p className="text-xs text-stone-600 mb-3">
              What challenges or problems does your audience face?
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={painPointInput}
                onChange={(e) => setPainPointInput(e.target.value)}
                onKeyPress={handlePainPointKeyPress}
                placeholder="Add a pain point..."
                className="flex-1 h-9 px-3 bg-stone-50 rounded-[8px] border border-stone-200 focus:border-[#3a8e9c] focus:ring-2 focus:ring-[#3a8e9c]/20 outline-none text-sm"
              />
              <Button
                size="sm"
                onClick={handleAddPainPoint}
                className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {audience.painPoints.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {audience.painPoints.map((painPoint, index) => (
              <Badge
                key={index}
                variant="outline"
                className="pr-1 flex items-center gap-2"
              >
                <span>{painPoint}</span>
                <button
                  onClick={() => handleRemovePainPoint(index)}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Goals */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-stone-100 rounded-[12px] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-[#3a8e9c]" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Audience Goals
            </label>
            <p className="text-xs text-stone-600 mb-3">
              What does your audience want to achieve?
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyPress={handleGoalKeyPress}
                placeholder="Add a goal..."
                className="flex-1 h-9 px-3 bg-stone-50 rounded-[8px] border border-stone-200 focus:border-[#3a8e9c] focus:ring-2 focus:ring-[#3a8e9c]/20 outline-none text-sm"
              />
              <Button
                size="sm"
                onClick={handleAddGoal}
                className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {audience.goals.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {audience.goals.map((goal, index) => (
              <Badge
                key={index}
                variant="outline"
                className="pr-1 flex items-center gap-2"
              >
                <span>{goal}</span>
                <button
                  onClick={() => handleRemoveGoal(index)}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="space-y-4 pt-6 border-t border-stone-200">
        <div className="text-sm text-stone-600 text-center sm:hidden">
          Step 2 of 3 • Define your audience
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={previousStep}
            className="w-full sm:w-auto"
          >
            Back to Source
          </Button>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="text-sm text-stone-600 text-center hidden sm:block">
              Step 2 of 3 • Define your audience
            </div>
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-[#3a8e9c] hover:bg-[#2d7a85] disabled:bg-stone-300 w-full sm:w-auto"
            >
              Continue to Formats
            </Button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
