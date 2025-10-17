"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Progress } from "@/components/atoms/progress";
import {
  socialImportService,
  SocialImportStatus,
} from "@/services/social-import";
import {
  Youtube,
  Instagram,
  Facebook,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  X,
} from "lucide-react";

interface ImportJobTrackerProps {
  jobId: string;
  onJobComplete?: (status: SocialImportStatus) => void;
  onJobRemove?: (jobId: string) => void;
}

const platformIcons = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
};

const statusColors = {
  INITIATED: "text-blue-600",
  PROCESSING: "text-yellow-600",
  COMPLETED: "text-green-600",
  FAILED: "text-red-600",
};

const statusIcons = {
  INITIATED: Clock,
  PROCESSING: Loader2,
  COMPLETED: CheckCircle,
  FAILED: AlertCircle,
};

export default function ImportJobTracker({
  jobId,
  onJobComplete,
  onJobRemove,
}: ImportJobTrackerProps) {
  const [jobStatus, setJobStatus] = useState<SocialImportStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobStatus = async () => {
    try {
      const status = await socialImportService.getImportStatus(jobId);
      setJobStatus(status);
      setError(null);

      if (status.status === "COMPLETED" && onJobComplete) {
        onJobComplete(status);
      }
    } catch (err) {
      console.error("Failed to fetch job status:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch job status";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobStatus();

    // Poll for status updates every 10 seconds if job is still in progress
    const interval = setInterval(() => {
      if (
        jobStatus &&
        (jobStatus.status === "INITIATED" || jobStatus.status === "PROCESSING")
      ) {
        fetchJobStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [jobId, jobStatus?.status]);

  const handleRemove = () => {
    if (onJobRemove) {
      onJobRemove(jobId);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchJobStatus();
  };

  if (isLoading && !jobStatus) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#3a8e9c]" />
            <span className="ml-2 text-sm text-gray-600">
              Loading job status...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !jobStatus) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-600">
                Failed to load job status
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!jobStatus) return null;

  const PlatformIcon =
    platformIcons[jobStatus.platform as keyof typeof platformIcons] || Youtube;
  const StatusIcon = statusIcons[jobStatus.status];
  const isProcessing = jobStatus.status === "PROCESSING";
  const isCompleted = jobStatus.status === "COMPLETED";
  const isFailed = jobStatus.status === "FAILED";

  const getProgressPercentage = () => {
    if (jobStatus.progress?.percentage) {
      return jobStatus.progress.percentage;
    }
    if (isCompleted) return 100;
    if (isFailed) return 0;
    return 25; // Default for INITIATED
  };

  const getStatusMessage = () => {
    switch (jobStatus.status) {
      case "INITIATED":
        return "Import started, preparing to fetch content...";
      case "PROCESSING":
        if (
          jobStatus.progress?.videosProcessed &&
          jobStatus.progress?.totalVideos
        ) {
          return `Processing videos: ${jobStatus.progress.videosProcessed}/${jobStatus.progress.totalVideos}`;
        }
        if (
          jobStatus.progress?.postsProcessed &&
          jobStatus.progress?.totalPosts
        ) {
          return `Processing posts: ${jobStatus.progress.postsProcessed}/${jobStatus.progress.totalPosts}`;
        }
        return "Processing your content...";
      case "COMPLETED":
        return `Import completed! Added ${jobStatus.result?.entriesAdded || 0} items to your knowledge base.`;
      case "FAILED":
        return jobStatus.errorMessage || "Import failed. Please try again.";
      default:
        return "Unknown status";
    }
  };

  return (
    <Card className="border-l-4 border-l-[#3a8e9c]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <PlatformIcon className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                {socialImportService.getPlatformName(jobStatus.platform)} Import
              </CardTitle>
              <p className="text-xs text-gray-500">
                Started {new Date(jobStatus.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isProcessing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Status */}
          <div className="flex items-center gap-2">
            <StatusIcon
              className={`h-4 w-4 ${statusColors[jobStatus.status]} ${isProcessing ? "animate-spin" : ""}`}
            />
            <span
              className={`text-sm font-medium ${statusColors[jobStatus.status]}`}
            >
              {jobStatus.status.charAt(0) +
                jobStatus.status.slice(1).toLowerCase()}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-xs text-gray-600">{getStatusMessage()}</p>
          </div>

          {/* Results */}
          {isCompleted && jobStatus.result && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Import Successful!
                </span>
              </div>
              <div className="text-xs text-green-700 space-y-1">
                {jobStatus.result.entriesAdded && (
                  <p>
                    • {jobStatus.result.entriesAdded} items added to knowledge
                    base
                  </p>
                )}
                {jobStatus.result.videosTranscribed && (
                  <p>• {jobStatus.result.videosTranscribed} videos processed</p>
                )}
                {jobStatus.result.postsProcessed && (
                  <p>• {jobStatus.result.postsProcessed} posts processed</p>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {isFailed && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Import Failed
                </span>
              </div>
              <p className="text-xs text-red-700">{getStatusMessage()}</p>
            </div>
          )}

          {/* Estimated Time */}
          {jobStatus.estimatedCompletion && !isCompleted && !isFailed && (
            <p className="text-xs text-gray-500">
              Estimated completion:{" "}
              {new Date(jobStatus.estimatedCompletion).toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
