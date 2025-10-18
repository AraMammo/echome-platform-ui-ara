"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Loader2, Share2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { showcaseService, BeforeAfterComparison } from "@/services/showcase";

const DEMO_PROMPTS = [
  {
    label: "Decline a Meeting",
    prompt: "Write an email politely declining a meeting request",
  },
  {
    label: "LinkedIn Post",
    prompt: "Write a LinkedIn post about productivity",
  },
  {
    label: "Sales Pitch",
    prompt: "Write a brief sales pitch for our product",
  },
  {
    label: "Follow-up Email",
    prompt: "Write a follow-up email after a sales call",
  },
];

export default function ShowcasePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [comparison, setComparison] = useState<BeforeAfterComparison | null>(
    null
  );
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (selectedPrompt: string) => {
    setIsGenerating(true);
    setPrompt(selectedPrompt);

    try {
      const response = await showcaseService.generateBeforeAfter({
        prompt: selectedPrompt,
        includeMetrics: true,
      });

      if (response.success) {
        setComparison(response.data);
        setSliderPosition(50); // Reset slider
      }
    } catch (error) {
      console.error("Error generating comparison:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-medium text-[#1c1c1e]">
            Your Voice Evolution
          </h1>
          <p className="text-lg text-[#9b8baf]">
            See the difference your training data makes
          </p>
        </div>

        {/* Demo Prompts */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-[#1c1c1e]">
            Try a prompt:
          </p>
          <div className="flex flex-wrap gap-3">
            {DEMO_PROMPTS.map((demo, index) => (
              <Button
                key={index}
                onClick={() => handleGenerate(demo.prompt)}
                disabled={isGenerating}
                variant="outline"
                className="border-[#3a8e9c] text-[#3a8e9c] hover:bg-[#3a8e9c]/10"
              >
                {demo.label}
              </Button>
            ))}
          </div>

          {/* Custom Prompt */}
          <div className="mt-4 flex gap-3">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Or enter custom prompt..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && prompt.trim()) {
                  handleGenerate(prompt);
                }
              }}
            />
            <Button
              onClick={() => handleGenerate(prompt)}
              disabled={isGenerating || !prompt.trim()}
              className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#3a8e9c]" />
            <p className="text-lg text-[#9b8baf]">
              Generating before/after comparison...
            </p>
          </div>
        )}

        {/* Before/After Comparison */}
        {comparison && !isGenerating && (
          <div className="space-y-6">
            {/* Comparison Slider */}
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-[20px] border-2 border-[#d5d2cc] bg-white"
              style={{ minHeight: "400px" }}
            >
              {/* Generic AI Side (Left) */}
              <div className="p-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[#1c1c1e]">
                    Generic AI (GPT-4)
                  </h3>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                    Standard
                  </span>
                </div>
                <div className="whitespace-pre-wrap text-[#1c1c1e]">
                  {comparison.genericOutput}
                </div>
              </div>

              {/* Personalized Side (Right) - Clips based on slider */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#3a8e9c]/5 to-[#9b8baf]/5 p-8"
                style={{
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[#1c1c1e]">
                    Your Echo Me Voice
                  </h3>
                  <span className="rounded-full bg-[#3a8e9c] px-3 py-1 text-xs text-white">
                    Personalized
                  </span>
                </div>
                <div className="whitespace-pre-wrap text-[#1c1c1e]">
                  {comparison.personalizedOutput}
                </div>
              </div>

              {/* Slider Handle */}
              <div
                className="absolute inset-y-0 z-10 w-1 cursor-ew-resize bg-[#3a8e9c]"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
              >
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3a8e9c] p-2 shadow-lg">
                  <div className="flex h-6 w-6 items-center justify-center text-white">
                    ⟷
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Instructions */}
            <p className="text-center text-sm text-[#9b8baf]">
              ← Drag the slider to compare →
            </p>

            {/* Improvement Metrics */}
            <div className="rounded-[20px] border border-[#3a8e9c]/20 bg-[#3a8e9c]/5 p-6">
              <h3 className="mb-4 text-lg font-medium text-[#1c1c1e]">
                Impact Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-2xl font-medium text-[#3a8e9c]">
                    +{comparison.improvementMetrics.overallImprovement}%
                  </p>
                  <p className="text-sm text-[#9b8baf]">Overall Improvement</p>
                </div>
                <div>
                  <p className="text-2xl font-medium text-[#3a8e9c]">
                    {comparison.improvementMetrics.personalityScore}%
                  </p>
                  <p className="text-sm text-[#9b8baf]">Personality Score</p>
                </div>
                <div>
                  <p className="text-2xl font-medium text-[#3a8e9c]">
                    {comparison.improvementMetrics.toneMatch}%
                  </p>
                  <p className="text-sm text-[#9b8baf]">Tone Match</p>
                </div>
                <div>
                  <p className="text-2xl font-medium text-[#3a8e9c]">
                    {comparison.improvementMetrics.styleConsistency}%
                  </p>
                  <p className="text-sm text-[#9b8baf]">Style Consistency</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push("/share")}
                className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share This Comparison
              </Button>
              <Button
                onClick={() => router.push("/evolution")}
                variant="outline"
                className="border-[#9b8baf] text-[#9b8baf] hover:bg-[#9b8baf]/10"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                See Full Evolution
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!comparison && !isGenerating && (
          <div className="flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#d5d2cc] py-16">
            <div className="mb-4 text-6xl">📊</div>
            <h3 className="mb-2 text-xl font-medium text-[#1c1c1e]">
              See Your Voice in Action
            </h3>
            <p className="mb-6 max-w-md text-center text-[#9b8baf]">
              Compare generic AI output with your personalized Echo Me voice.
              Try a demo prompt or enter your own!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
