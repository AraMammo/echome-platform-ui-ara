"use client";

import React, { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import {
  FileText,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Mail,
  Video,
  Check,
} from "lucide-react";
import { useGenerationStore, ContentFormat } from "@/stores/generation-store";
import { cn } from "@/utils/cn";

interface FormatOption {
  format: ContentFormat;
  icon: React.ElementType;
  title: string;
  description: string;
  category: "Social" | "Long-form" | "Video";
  estimatedTime: string;
}

const formatOptions: FormatOption[] = [
  {
    format: "blog_post",
    icon: FileText,
    title: "Blog Post",
    description: "Long-form article (800-2000 words)",
    category: "Long-form",
    estimatedTime: "2-3 min",
  },
  {
    format: "linkedin_post",
    icon: Linkedin,
    title: "LinkedIn Post",
    description: "Professional networking content",
    category: "Social",
    estimatedTime: "1 min",
  },
  {
    format: "tweet",
    icon: Twitter,
    title: "Tweet Thread",
    description: "Multiple connected tweets",
    category: "Social",
    estimatedTime: "1 min",
  },
  {
    format: "instagram_caption",
    icon: Instagram,
    title: "Instagram Caption",
    description: "Visual-focused caption with hashtags",
    category: "Social",
    estimatedTime: "1 min",
  },
  {
    format: "facebook_post",
    icon: Facebook,
    title: "Facebook Post",
    description: "Engaging community content",
    category: "Social",
    estimatedTime: "1 min",
  },
  {
    format: "youtube_script",
    icon: Youtube,
    title: "YouTube Script",
    description: "Video script with timestamps",
    category: "Video",
    estimatedTime: "2-3 min",
  },
  {
    format: "newsletter",
    icon: Mail,
    title: "Newsletter",
    description: "Email-friendly formatted content",
    category: "Long-form",
    estimatedTime: "2-3 min",
  },
  {
    format: "video_clip",
    icon: Video,
    title: "Video Clips",
    description: "Short-form video segments",
    category: "Video",
    estimatedTime: "3-5 min",
  },
];

export function FormatStep() {
  const {
    selectedFormats,
    toggleFormat,
    setFormats,
    clearFormats,
    previousStep,
    nextStep,
  } = useGenerationStore();

  const [selectedCategory, setSelectedCategory] = useState<
    "All" | "Social" | "Long-form" | "Video"
  >("All");

  const filteredFormats =
    selectedCategory === "All"
      ? formatOptions
      : formatOptions.filter((opt) => opt.category === selectedCategory);

  const categories = ["All", "Social", "Long-form", "Video"];

  const handleSelectAll = () => {
    const allFormats = formatOptions.map((opt) => opt.format);
    setFormats(allFormats);
  };

  const canProceed = () => {
    return selectedFormats.length > 0;
  };

  const getTotalEstimatedTime = () => {
    const times = selectedFormats.map((format) => {
      const option = formatOptions.find((opt) => opt.format === format);
      if (!option) return 0;

      const timeStr = option.estimatedTime;
      const match = timeStr.match(/(\d+)(?:-(\d+))?/);
      if (match) {
        const min = parseInt(match[1]);
        const max = match[2] ? parseInt(match[2]) : min;
        return (min + max) / 2;
      }
      return 0;
    });

    const total = times.reduce((acc, time) => acc + time, 0);
    return Math.ceil(total);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-medium text-zinc-900 mb-2">
          Select Content Formats
        </h2>
        <p className="text-stone-600">
          Choose which formats you want to generate
        </p>
      </div>

      {/* Selection Summary */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-zinc-900">
              {selectedFormats.length} format
              {selectedFormats.length !== 1 ? "s" : ""} selected
            </div>
            <div className="text-xs text-stone-600 mt-1">
              Estimated generation time: ~{getTotalEstimatedTime()} minutes
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedFormats.length === formatOptions.length}
              className="flex-1 sm:flex-initial"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFormats}
              disabled={selectedFormats.length === 0}
              className="flex-1 sm:flex-initial"
            >
              Clear All
            </Button>
          </div>
        </div>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() =>
              setSelectedCategory(category as typeof selectedCategory)
            }
            className={cn(
              "px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              selectedCategory === category
                ? "bg-[#3a8e9c] text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Format Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFormats.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedFormats.includes(option.format);

          return (
            <button
              key={option.format}
              onClick={() => toggleFormat(option.format)}
              className={cn(
                "relative p-5 rounded-[16px] border-2 transition-all text-left",
                "hover:border-[#3a8e9c] hover:shadow-sm",
                isSelected
                  ? "border-[#3a8e9c] bg-[#3a8e9c]/5"
                  : "border-stone-200 bg-white"
              )}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-[#3a8e9c] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Icon and Title */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0",
                    isSelected
                      ? "bg-[#3a8e9c] text-white"
                      : "bg-stone-100 text-stone-600"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-zinc-900">
                    {option.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className="mt-1 text-xs border-stone-300 text-stone-600"
                  >
                    {option.category}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-stone-600 mb-3">
                {option.description}
              </p>

              {/* Time Estimate */}
              <div className="text-xs text-stone-500">
                ⏱ {option.estimatedTime}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Formats Preview */}
      {selectedFormats.length > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-medium text-zinc-900 mb-3">
            Selected Formats
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedFormats.map((format) => {
              const option = formatOptions.find((opt) => opt.format === format);
              if (!option) return null;

              const Icon = option.icon;

              return (
                <div
                  key={format}
                  className="flex items-center gap-2 px-3 py-2 bg-[#3a8e9c]/10 border border-[#3a8e9c]/30 rounded-full"
                >
                  <Icon className="w-4 h-4 text-[#3a8e9c]" />
                  <span className="text-sm font-medium text-zinc-900">
                    {option.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFormat(format);
                    }}
                    className="ml-1 text-stone-500 hover:text-red-600"
                  >
                    <span className="text-xs">×</span>
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-4 pt-6 border-t border-stone-200">
        <div className="text-sm text-stone-600 text-center sm:hidden">
          Step 3 of 4 • Select content formats
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={previousStep}
            className="w-full sm:w-auto"
          >
            Back to Audience
          </Button>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="text-sm text-stone-600 text-center hidden sm:block">
              Step 3 of 4 • Select content formats
            </div>
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-[#3a8e9c] hover:bg-[#2d7a85] disabled:bg-stone-300 w-full sm:w-auto"
            >
              Continue to Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
