"use client";

import React, { useEffect } from "react";
import { GenerationStepper } from "@/components/molecules/generation-stepper";
import { SourceStep } from "@/components/molecules/generation-steps/source-step";
import { AudienceStep } from "@/components/molecules/generation-steps/audience-step";
import { FormatStep } from "@/components/molecules/generation-steps/format-step";
import { GenerateStep } from "@/components/molecules/generation-steps/generate-step";
import { useGenerationStore } from "@/stores/generation-store";
import { Card } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Save, RotateCcw } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Source",
    description: "Choose content source",
  },
  {
    number: 2,
    title: "Audience",
    description: "Define your audience",
  },
  {
    number: 3,
    title: "Formats",
    description: "Select output formats",
  },
  {
    number: 4,
    title: "Generate",
    description: "Review and generate",
  },
];

export default function GeneratePage() {
  const {
    currentStep,
    setStep,
    hasDraft,
    draftLastSaved,
    loadDraft,
    saveDraft,
    reset,
  } = useGenerationStore();

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SourceStep />;
      case 2:
        return <AudienceStep />;
      case 3:
        return <FormatStep />;
      case 4:
        return <GenerateStep />;
      default:
        return <SourceStep />;
    }
  };

  const formatLastSaved = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-zinc-900 mb-2">
            Generate Content
          </h1>
          <p className="text-base sm:text-lg text-stone-600">
            Create content in your voice, tailored to your audience
          </p>
        </div>

        {/* Draft Recovery Banner */}
        {hasDraft && draftLastSaved && currentStep === 1 && (
          <Card className="p-4 mb-6 border-[#3a8e9c] bg-[#3a8e9c]/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-zinc-900 mb-1">
                  Draft Recovered
                </div>
                <div className="text-xs text-stone-600">
                  Last saved {formatLastSaved(draftLastSaved)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to start fresh? Your draft will be lost."
                      )
                    ) {
                      reset();
                    }
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Start Fresh
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Progress Stepper */}
        <div className="mb-8 sm:mb-12">
          <GenerationStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={setStep}
          />
        </div>

        {/* Step Content */}
        <div className="mb-8">{renderStep()}</div>

        {/* Auto-save indicator */}
        {currentStep < 4 && (
          <div className="text-center">
            <p className="text-xs text-stone-500">
              <Save className="w-3 h-3 inline mr-1" />
              Your progress is automatically saved
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
