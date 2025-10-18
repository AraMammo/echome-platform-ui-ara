"use client";

import React, { useState } from "react";
import { Button } from "@/components/atoms/button";
import { ThumbsUp, ThumbsDown, Check, Copy } from "lucide-react";
import { ComparisonOutput } from "@/services/voice-comparison";
import { cn } from "@/utils/cn";

interface VersionComparisonGridProps {
  outputs: ComparisonOutput[];
  onVote: (outputId: string, vote: "up" | "down") => void;
  onSelectVersion: (outputId: string) => void;
  votes: Map<string, "up" | "down">;
  selectedVersion?: string;
}

export function VersionComparisonGrid({
  outputs,
  onVote,
  onSelectVersion,
  votes,
  selectedVersion,
}: VersionComparisonGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getVersionLabel = (index: number) => {
    const labels = ["A", "B", "C", "D", "E"];
    return labels[index] || `V${index + 1}`;
  };

  const getTemperatureColor = (temp?: number) => {
    if (!temp) return "#9b8baf";
    if (temp < 0.6) return "#3a8e9c"; // Cool blue-green
    if (temp < 0.8) return "#9b8baf"; // Medium purple
    return "#b4a398"; // Warm taupe
  };

  return (
    <div
      className={cn(
        "grid gap-4",
        outputs.length === 2 && "grid-cols-1 md:grid-cols-2",
        outputs.length === 3 && "grid-cols-1 md:grid-cols-3",
        outputs.length === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        outputs.length === 5 &&
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      )}
    >
      {outputs.map((output, index) => {
        const isSelected = selectedVersion === output.id;
        const vote = votes.get(output.id);
        const isCopied = copiedId === output.id;

        return (
          <div
            key={output.id}
            className={cn(
              "rounded-[20px] border-2 p-6 transition-all",
              isSelected
                ? "border-[#3a8e9c] bg-[#3a8e9c]/5"
                : "border-[#d5d2cc] bg-white hover:border-[#9b8baf]"
            )}
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="mb-1 text-lg font-medium text-[#1c1c1e]">
                  Version {getVersionLabel(index)}
                </h3>
                <div className="flex items-center gap-2 text-sm text-[#9b8baf]">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: getTemperatureColor(
                        output.config.temperature
                      ),
                    }}
                  />
                  <span>
                    Temp: {output.config.temperature?.toFixed(1) || "0.7"}
                  </span>
                  {output.config.tone && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{output.config.tone}</span>
                    </>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3a8e9c]">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="mb-4 max-h-[300px] overflow-y-auto rounded-[10px] bg-[#f3f1ec] p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#1c1c1e]">
                {output.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Vote buttons */}
              <button
                onClick={() => onVote(output.id, "up")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  vote === "up"
                    ? "bg-[#3a8e9c] text-white"
                    : "bg-[#f3f1ec] text-[#9b8baf] hover:bg-[#3a8e9c]/20"
                )}
                aria-label="Vote up"
              >
                <ThumbsUp className="h-4 w-4" />
              </button>

              <button
                onClick={() => onVote(output.id, "down")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  vote === "down"
                    ? "bg-[#b4a398] text-white"
                    : "bg-[#f3f1ec] text-[#9b8baf] hover:bg-[#b4a398]/20"
                )}
                aria-label="Vote down"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>

              {/* Copy button */}
              <button
                onClick={() => handleCopy(output.content, output.id)}
                className="ml-auto flex h-8 items-center gap-1 rounded-lg bg-[#f3f1ec] px-3 text-sm text-[#9b8baf] transition-colors hover:bg-[#d5d2cc]"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>

              {/* Select button */}
              <Button
                onClick={() => onSelectVersion(output.id)}
                size="sm"
                className={cn(
                  isSelected
                    ? "bg-[#3a8e9c] text-white"
                    : "border-[#3a8e9c] text-[#3a8e9c] hover:bg-[#3a8e9c] hover:text-white",
                  "border"
                )}
                variant={isSelected ? "default" : "outline"}
              >
                {isSelected ? "Selected" : "Pick This"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
