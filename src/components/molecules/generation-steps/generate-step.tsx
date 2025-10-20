"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Loader } from "@/components/atoms/loader";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  Layers,
  Download,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useGenerationStore } from "@/stores/generation-store";
import { contentKitService, ContentKitStatus } from "@/services/content-kit";
import { useRouter } from "next/navigation";

export function GenerateStep() {
  const router = useRouter();
  const {
    sourceType,
    textInput,
    fileId,
    fileName,
    urls,
    useKnowledgeBase,
    audience,
    selectedFormats,
    isGenerating,
    jobId,
    error,
    setIsGenerating,
    setJobId,
    setError,
    previousStep,
    reset,
    clearDraft,
  } = useGenerationStore();

  const [contentKitStatus, setContentKitStatus] =
    useState<ContentKitStatus | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Map frontend format names to backend ContentType names
  const mapFormatsToContentTypes = (
    formats: typeof selectedFormats
  ): string[] => {
    const formatMap: Record<string, string> = {
      blog_post: "blogPost",
      linkedin_post: "linkedInPost",
      tweet: "tweets",
      instagram_caption: "instagramCarousel",
      facebook_post: "facebookPost",
      youtube_script: "youtubeScript",
      newsletter: "newsletter",
      video_clip: "videoClips",
    };

    return formats.map((format) => formatMap[format] || format);
  };

  // Start generation
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setContentKitStatus(null);

    try {
      // Get userId from localStorage
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      // Prepare request based on source type
      let inputType: "video" | "prompt" | "voice_note" | "social_import";
      const baseInputData: {
        userId: string;
        fileId?: string;
        text?: string;
        content?: string;
        selectedContentTypes?: string[];
      } = {
        userId,
        selectedContentTypes: mapFormatsToContentTypes(selectedFormats),
      };

      if (sourceType === "file" && fileId) {
        inputType = "video";
        baseInputData.fileId = fileId;
      } else if (sourceType === "text" && textInput.trim()) {
        inputType = "prompt";
        baseInputData.text = textInput.trim();
      } else if (sourceType === "url" && urls.length > 0) {
        inputType = "social_import";
        // For social import, we'll pass URLs as content
        baseInputData.content = JSON.stringify({
          urls,
          useKnowledgeBase,
        });
      } else {
        throw new Error("Invalid source configuration");
      }

      // Add metadata as content field if not already used
      if (!baseInputData.content) {
        baseInputData.content = JSON.stringify({
          audience,
          useKnowledgeBase,
        });
      }

      const response = await contentKitService.generateContentKit({
        inputType,
        inputData: baseInputData,
      });

      setJobId(response.jobId);
      startPolling(response.jobId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start generation"
      );
      setIsGenerating(false);
    }
  };

  // Start polling for status
  const startPolling = (generationJobId: string) => {
    const interval = setInterval(async () => {
      try {
        const status =
          await contentKitService.getContentKitStatus(generationJobId);
        setContentKitStatus(status);

        if (status.status === "COMPLETED" || status.status === "FAILED") {
          stopPolling();
          setIsGenerating(false);

          if (status.status === "COMPLETED") {
            // Clear draft on successful completion
            clearDraft();
          }
        }
      } catch (err) {
        setError("Failed to check generation status");
        stopPolling();
        setIsGenerating(false);
      }
    }, 2000); // Poll every 2 seconds

    setPollingInterval(interval);
  };

  // Stop polling
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // Handle download
  const handleDownload = async () => {
    if (!jobId) return;

    try {
      const response = await contentKitService.downloadContentKit(jobId);
      const link = document.createElement("a");
      link.href = response.downloadUrl;
      link.download = `content-kit-${jobId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download content kit"
      );
    }
  };

  // Handle view in library
  const handleViewInLibrary = () => {
    if (jobId) {
      router.push(`/library/${jobId}`);
    }
  };

  // Handle start over
  const handleStartOver = () => {
    stopPolling();
    reset();
  };

  const getSourceSummary = () => {
    switch (sourceType) {
      case "text":
        return `Text input (${textInput.length} characters)`;
      case "file":
        return `File: ${fileName}`;
      case "url":
        return `${urls.length} URL${urls.length !== 1 ? "s" : ""}`;
      default:
        return "Unknown source";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-medium text-zinc-900 mb-2">
          Review & Generate
        </h2>
        <p className="text-stone-600">
          Review your configuration and start generating
        </p>
      </div>

      {!isGenerating && !contentKitStatus && (
        <>
          {/* Configuration Summary */}
          <div className="grid gap-4">
            {/* Source */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-stone-100 rounded-[12px] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-[#3a8e9c]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-zinc-900 mb-1">
                    Content Source
                  </h3>
                  <p className="text-sm text-stone-600">{getSourceSummary()}</p>
                  {useKnowledgeBase && (
                    <Badge
                      variant="outline"
                      className="mt-2 text-xs border-[#3a8e9c] text-[#3a8e9c]"
                    >
                      Knowledge Base Enabled
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Audience */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-stone-100 rounded-[12px] flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-[#3a8e9c]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-zinc-900 mb-2">
                    Target Audience
                  </h3>
                  <div className="space-y-1 text-sm text-stone-600">
                    <p>
                      <span className="font-medium">Name:</span> {audience.name}
                    </p>
                    <p>
                      <span className="font-medium">Tone:</span> {audience.tone}
                    </p>
                    <p>
                      <span className="font-medium">Style:</span>{" "}
                      {audience.style}
                    </p>
                    {audience.targetDemographic && (
                      <p>
                        <span className="font-medium">Demographic:</span>{" "}
                        {audience.targetDemographic}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Formats */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-stone-100 rounded-[12px] flex items-center justify-center flex-shrink-0">
                  <Layers className="w-6 h-6 text-[#3a8e9c]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-zinc-900 mb-2">
                    Selected Formats ({selectedFormats.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFormats.map((format) => (
                      <Badge key={format} variant="outline" className="text-xs">
                        {format.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-900 mb-1">
                    Generation Error
                  </h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-stone-200">
            <Button variant="outline" onClick={previousStep}>
              Back to Formats
            </Button>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleGenerate}
                className="bg-[#3a8e9c] hover:bg-[#2d7a85] px-8"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content Kit
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Generation In Progress */}
      {isGenerating && !contentKitStatus?.status && (
        <Card className="p-8 text-center">
          <Loader className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            Starting Generation...
          </h3>
          <p className="text-sm text-stone-600">Preparing your content kit</p>
        </Card>
      )}

      {/* Generation Status */}
      {contentKitStatus && (
        <div className="space-y-6">
          {/* Status Header */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              {contentKitStatus.status === "PROCESSING" && (
                <div className="w-12 h-12 bg-[#3a8e9c]/10 rounded-full flex items-center justify-center">
                  <Loader className="text-[#3a8e9c]" />
                </div>
              )}
              {contentKitStatus.status === "COMPLETED" && (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              )}
              {contentKitStatus.status === "FAILED" && (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-zinc-900">
                  {contentKitStatus.status === "PROCESSING" &&
                    "Generating Content..."}
                  {contentKitStatus.status === "COMPLETED" &&
                    "Generation Complete!"}
                  {contentKitStatus.status === "FAILED" && "Generation Failed"}
                </h3>
                <p className="text-sm text-stone-600 mt-1">
                  {contentKitStatus.kitName}
                </p>
              </div>
            </div>
          </Card>

          {/* Progress Bar */}
          {contentKitStatus.progress &&
            contentKitStatus.status === "PROCESSING" && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-900">
                      {contentKitStatus.progress.currentStep}
                    </span>
                    <span className="text-sm text-stone-600">
                      {contentKitStatus.progress.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div
                      className="bg-[#3a8e9c] h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${contentKitStatus.progress.percentage}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span>
                      Step {contentKitStatus.progress.completedSteps.length} of{" "}
                      {contentKitStatus.progress.totalSteps}
                    </span>
                    {contentKitStatus.progress.estimatedTimeRemaining && (
                      <span>
                        ~{contentKitStatus.progress.estimatedTimeRemaining} min
                        remaining
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )}

          {/* Generated Outputs */}
          {contentKitStatus.outputs &&
            Object.keys(contentKitStatus.outputs).length > 0 && (
              <Card className="p-6">
                <h3 className="text-sm font-medium text-zinc-900 mb-4">
                  Generated Content
                </h3>
                <div className="space-y-2">
                  {contentKitStatus.outputs.transcript && (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Transcript
                    </div>
                  )}
                  {contentKitStatus.outputs.blogPost && (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Blog Post
                    </div>
                  )}
                  {contentKitStatus.outputs.linkedInPost && (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      LinkedIn Post
                    </div>
                  )}
                  {contentKitStatus.outputs.tweets && (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Tweet Thread ({
                        contentKitStatus.outputs.tweets.length
                      }{" "}
                      tweets)
                    </div>
                  )}
                  {contentKitStatus.outputs.instagramCarousel && (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Instagram Carousel
                    </div>
                  )}
                  {contentKitStatus.outputs.facebookPost && (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Facebook Post
                    </div>
                  )}
                  {contentKitStatus.outputs.youtubeScript && (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      YouTube Script
                    </div>
                  )}
                  {contentKitStatus.outputs.newsletter && (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Newsletter
                    </div>
                  )}
                  {contentKitStatus.outputs.videoClips && (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Video Clips ({contentKitStatus.outputs.videoClips.length})
                    </div>
                  )}
                </div>
              </Card>
            )}

          {/* Error Message */}
          {contentKitStatus.errorMessage && (
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-start gap-4">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-900 mb-1">
                    Error
                  </h3>
                  <p className="text-sm text-red-700">
                    {contentKitStatus.errorMessage}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          {contentKitStatus.status === "COMPLETED" && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="px-6"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Kit
              </Button>
              <Button
                onClick={handleViewInLibrary}
                className="bg-[#3a8e9c] hover:bg-[#2d7a85] px-6"
              >
                <Eye className="w-4 h-4 mr-2" />
                View in Library
              </Button>
              <Button variant="outline" onClick={handleStartOver}>
                Generate Another
              </Button>
            </div>
          )}

          {contentKitStatus.status === "FAILED" && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <Button variant="outline" onClick={previousStep}>
                Back to Review
              </Button>
              <Button
                onClick={handleGenerate}
                className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
