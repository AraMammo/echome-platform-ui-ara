"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import {
  CheckCircle,
  Upload,
  Link as LinkIcon,
  Target,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";
import { oauthService } from "@/services/oauth";

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to EchoMe! 👋",
    description: "Let's set up your Echosystem in 3 quick steps",
  },
  {
    id: "connect",
    title: "Connect Your Social Accounts",
    description:
      "Link your social media to import content and train your voice model",
  },
  {
    id: "upload",
    title: "Upload Your Content",
    description:
      "Add 3-5 past posts or voice notes to personalize your content style",
  },
  {
    id: "goals",
    title: "Set Your Content Goals",
    description: "Tell us what you want to achieve with EchoMe",
  },
];

export default function OnboardingWizard({
  isOpen,
  onComplete,
  onSkip,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const platforms = [
    { id: "instagram", name: "Instagram", color: "bg-pink-500" },
    { id: "youtube", name: "YouTube", color: "bg-red-500" },
    { id: "linkedin", name: "LinkedIn", color: "bg-blue-600" },
    { id: "twitter", name: "Twitter/X", color: "bg-black" },
  ];

  const goals = [
    "Increase social media presence",
    "Save time on content creation",
    "Maintain consistent posting schedule",
    "Repurpose existing content",
    "Grow my personal brand",
    "Generate more leads",
  ];

  const handleConnectPlatform = async (platformId: string) => {
    try {
      if (platformId === "twitter") {
        await oauthService.connectTwitter();
      } else if (platformId === "linkedin") {
        await oauthService.connectLinkedIn();
      } else if (platformId === "instagram" || platformId === "facebook") {
        await oauthService.connectMeta();
      }
      setConnectedPlatforms((prev) => [...prev, platformId]);
    } catch (error) {
      console.error(`Error connecting ${platformId}:`, error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles((prev) => prev + files.length);
    }
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Save onboarding completion to localStorage
      localStorage.setItem("echome_onboarding_completed", "true");
      localStorage.setItem(
        "echome_onboarding_data",
        JSON.stringify({
          connectedPlatforms,
          uploadedFiles,
          selectedGoals,
          completedAt: new Date().toISOString(),
        })
      );
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // Welcome screen
      case 1:
        return connectedPlatforms.length > 0; // At least one platform
      case 2:
        return uploadedFiles >= 3; // At least 3 files
      case 3:
        return selectedGoals.length > 0; // At least one goal
      default:
        return true;
    }
  };

  const getProgress = () => {
    return ((currentStep + 1) / STEPS.length) * 100;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-3xl p-0 overflow-hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Progress Bar */}
        <div className="w-full h-2 bg-stone-200">
          <div
            className="h-full bg-[#3a8e9c] transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-zinc-900 font-['Satoshi']">
                {STEPS[currentStep].title}
              </h2>
              <button
                onClick={onSkip}
                className="text-stone-500 hover:text-stone-700 transition-colors"
                title="Skip onboarding"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-stone-600 font-['Satoshi']">
              {STEPS[currentStep].description}
            </p>
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentStep === 0 && (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-[#3a8e9c]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎉</span>
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-4">
                  Ready to Unmute Yourself?
                </h3>
                <p className="text-stone-600 max-w-md mx-auto mb-6">
                  EchoMe helps you create authentic content that sounds like
                  you, at scale. Let&apos;s personalize your experience in just
                  a few minutes.
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#3a8e9c]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <LinkIcon className="text-[#3a8e9c]" size={20} />
                    </div>
                    <p className="text-sm text-stone-600">Connect</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#9b8baf]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Upload className="text-[#9b8baf]" size={20} />
                    </div>
                    <p className="text-sm text-stone-600">Upload</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#b4a398]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target className="text-[#b4a398]" size={20} />
                    </div>
                    <p className="text-sm text-stone-600">Set Goals</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle
                      className={
                        connectedPlatforms.length > 0
                          ? "text-green-500"
                          : "text-stone-300"
                      }
                      size={20}
                    />
                    <span className="text-sm font-medium text-stone-700">
                      {connectedPlatforms.length} platform
                      {connectedPlatforms.length !== 1 ? "s" : ""} connected
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 mb-4">
                    Connect at least one platform to import your content and
                    train your voice model. You can add more later.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {platforms.map((platform) => {
                    const isConnected = connectedPlatforms.includes(
                      platform.id
                    );
                    return (
                      <button
                        key={platform.id}
                        onClick={() => handleConnectPlatform(platform.id)}
                        disabled={isConnected}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          isConnected
                            ? "border-green-500 bg-green-50"
                            : "border-stone-200 hover:border-[#3a8e9c] hover:bg-stone-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white font-bold`}
                          >
                            {platform.name[0]}
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-medium text-zinc-900">
                              {platform.name}
                            </div>
                            {isConnected && (
                              <div className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle size={12} />
                                Connected
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Why connect?</strong> We&apos;ll analyze your past
                    content to understand your unique voice, tone, and style.
                    This helps generate content that truly sounds like you.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle
                      className={
                        uploadedFiles >= 3 ? "text-green-500" : "text-stone-300"
                      }
                      size={20}
                    />
                    <span className="text-sm font-medium text-stone-700">
                      {uploadedFiles} file{uploadedFiles !== 1 ? "s" : ""}{" "}
                      uploaded (minimum 3)
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 mb-4">
                    Upload 3-5 examples of your best content. This can be blog
                    posts, social media captions, scripts, or voice notes.
                  </p>
                </div>

                <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center hover:border-[#3a8e9c] transition-colors">
                  <input
                    type="file"
                    id="onboarding-file-upload"
                    multiple
                    accept=".txt,.pdf,.doc,.docx,.mp3,.wav,.m4a"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="onboarding-file-upload"
                    className="cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-[#3a8e9c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="text-[#3a8e9c]" size={24} />
                    </div>
                    <p className="text-zinc-900 font-medium mb-2">
                      Click to upload files
                    </p>
                    <p className="text-sm text-stone-600">
                      PDF, TXT, DOC, MP3, WAV, M4A (max 10MB each)
                    </p>
                  </label>
                </div>

                {uploadedFiles > 0 && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-900">
                      ✓ Great! Your files are being analyzed to learn your
                      unique style.
                    </p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-900">
                    <strong>Tip:</strong> The more examples you provide, the
                    better we can match your authentic voice and style.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="mb-6">
                  <p className="text-sm text-stone-600 mb-4">
                    Select all that apply. This helps us tailor your experience
                    and suggest the right features.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {goals.map((goal) => {
                    const isSelected = selectedGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? "border-[#3a8e9c] bg-[#3a8e9c]/5"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-[#3a8e9c] bg-[#3a8e9c]"
                                : "border-stone-300"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle className="text-white" size={14} />
                            )}
                          </div>
                          <span className="text-sm font-medium text-zinc-900">
                            {goal}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-900">
                    <strong>Knowledge Base Active!</strong> Once you complete
                    this setup, your personalized content engine will be ready
                    to generate content that matches your voice and goals.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="border-stone-300"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? "bg-[#3a8e9c] w-6"
                      : index < currentStep
                        ? "bg-[#3a8e9c]/50"
                        : "bg-stone-300"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white"
            >
              {currentStep === STEPS.length - 1 ? "Complete Setup" : "Next"}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
