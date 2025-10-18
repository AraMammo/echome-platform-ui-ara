"use client";

import React, { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Textarea } from "@/components/atoms/textarea";
import { Loader2, Settings as SettingsIcon } from "lucide-react";
import { useComparisonStore } from "@/stores/comparison-store";
import { VersionComparisonGrid } from "@/components/organisms/voice-comparison/version-comparison-grid";

export default function ComparePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<string>();

  const {
    currentComparison,
    isGenerating,
    generateComparison,
    recordVote,
    votes,
    error,
  } = useComparisonStore();

  const handleGenerate = async (versionCount: number) => {
    if (!prompt.trim()) return;
    setSelectedVersion(undefined);
    await generateComparison(prompt, versionCount);
  };

  // Calculate preferences from votes (simplified)
  const getPreferenceSummary = () => {
    if (votes.size === 0) return null;

    const upvotes = Array.from(votes.values()).filter((v) => v === "up").length;
    const totalVotes = votes.size;

    return {
      upvotePercentage: Math.round((upvotes / totalVotes) * 100),
      totalComparisons: totalVotes,
    };
  };

  const preferences = getPreferenceSummary();

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-medium text-[#1c1c1e]">
              Voice Comparison Studio
            </h1>
            <p className="text-lg text-[#9b8baf]">
              Test your AI voice with different settings
            </p>
          </div>
          <Button variant="outline" className="border-[#d5d2cc] text-[#9b8baf]">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Prompt Input Section */}
        <div className="mb-8 rounded-[20px] border border-[#d5d2cc] bg-white p-6">
          <label className="mb-3 block text-sm font-medium text-[#1c1c1e]">
            Prompt:
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write a LinkedIn post about productivity hacks"
            rows={4}
            className="mb-4 w-full resize-none rounded-[10px] border-[#d5d2cc] bg-[#f3f1ec] px-4 py-3 text-[#1c1c1e] placeholder:text-[#9b8baf] focus:border-[#3a8e9c] focus:outline-none focus:ring-2 focus:ring-[#3a8e9c]/20"
          />

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleGenerate(3)}
              disabled={isGenerating || !prompt.trim()}
              className="bg-[#3a8e9c] text-white hover:bg-[#2d7a85]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate 3 Versions"
              )}
            </Button>
            <Button
              onClick={() => handleGenerate(5)}
              disabled={isGenerating || !prompt.trim()}
              variant="outline"
              className="border-[#3a8e9c] text-[#3a8e9c] hover:bg-[#3a8e9c]/10"
            >
              Generate 5 Versions
            </Button>
            <Button
              onClick={() => handleGenerate(4)}
              disabled={isGenerating || !prompt.trim()}
              variant="outline"
              className="border-[#9b8baf] text-[#9b8baf] hover:bg-[#9b8baf]/10"
            >
              Custom
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-[10px] border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#3a8e9c]" />
            <p className="text-lg text-[#9b8baf]">
              Generating {currentComparison?.outputs.length || 3} versions with
              different settings...
            </p>
            <p className="mt-2 text-sm text-[#9b8baf]">
              This may take a few moments
            </p>
          </div>
        )}

        {/* Comparison Grid */}
        {currentComparison && !isGenerating && (
          <>
            <VersionComparisonGrid
              outputs={currentComparison.outputs}
              onVote={recordVote}
              onSelectVersion={setSelectedVersion}
              votes={votes}
              selectedVersion={selectedVersion}
            />

            {/* Preferences Summary */}
            {preferences && preferences.totalComparisons >= 3 && (
              <div className="mt-8 rounded-[20px] border border-[#3a8e9c]/20 bg-[#3a8e9c]/5 p-6">
                <h3 className="mb-4 text-lg font-medium text-[#1c1c1e]">
                  Your Preferences (based on {preferences.totalComparisons}{" "}
                  {preferences.totalComparisons === 1
                    ? "comparison"
                    : "comparisons"}
                  )
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-[#1c1c1e]">
                    <span className="text-base">•</span>
                    You prefer outputs {preferences.upvotePercentage}% of the
                    time
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#9b8baf]">
                    <span className="text-base">→</span>
                    Keep voting to build your taste profile
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="mt-4 border-[#3a8e9c] text-[#3a8e9c] hover:bg-[#3a8e9c]/10"
                  onClick={() => {
                    /* Navigate to taste profile */
                  }}
                >
                  View Full Taste Profile →
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!currentComparison && !isGenerating && (
          <div className="flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#d5d2cc] py-16">
            <div className="mb-4 text-6xl">🧪</div>
            <h3 className="mb-2 text-xl font-medium text-[#1c1c1e]">
              Ready to test your voice?
            </h3>
            <p className="mb-6 max-w-md text-center text-[#9b8baf]">
              Enter a prompt above and generate multiple versions to see how
              different settings affect your outputs.
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#9b8baf]">
              <p className="flex items-center gap-2">
                <span className="text-[#3a8e9c]">✓</span>
                Compare different temperatures and tones
              </p>
              <p className="flex items-center gap-2">
                <span className="text-[#3a8e9c]">✓</span>
                Vote on your favorites to build your taste profile
              </p>
              <p className="flex items-center gap-2">
                <span className="text-[#3a8e9c]">✓</span>
                Get personalized recommendations over time
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
