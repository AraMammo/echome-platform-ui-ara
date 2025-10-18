"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { useToast } from "@/components/atoms/toast";
import {
  socialImportService,
  SocialImportRequest,
} from "@/services/social-import";
import {
  Youtube,
  Instagram,
  Facebook,
  Linkedin,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface ImportStatus {
  status: "idle" | "importing" | "processing" | "completed" | "failed";
  jobId?: string;
  message?: string;
  entriesAdded?: number;
}

interface SocialImportSectionProps {
  onImportSuccess?: (platform: string, entriesAdded: number) => void;
}

export default function SocialImportSection({
  onImportSuccess,
}: SocialImportSectionProps) {
  const { showToast } = useToast();

  // State for URL inputs
  const [urls, setUrls] = useState({
    youtube: "",
    instagram: "",
    facebook: "",
    linkedin: "",
  });

  // State for import statuses
  const [statuses, setStatuses] = useState<Record<string, ImportStatus>>({
    youtube: { status: "idle" },
    instagram: { status: "idle" },
    facebook: { status: "idle" },
    linkedin: { status: "idle" },
  });

  // Polling intervals
  const [pollingIntervals, setPollingIntervals] = useState<
    Record<string, NodeJS.Timeout>
  >({});

  // Clean up polling intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(pollingIntervals).forEach((interval) =>
        clearInterval(interval)
      );
    };
  }, [pollingIntervals]);

  const handleImport = async (platform: string, url: string) => {
    if (!url || !url.trim()) {
      showToast("Please enter a valid URL");
      return;
    }

    // Validate URL
    const validation = socialImportService.validateUrl(platform, url);
    if (!validation.isValid) {
      showToast(validation.error || "Please enter a valid URL");
      return;
    }

    try {
      // Update status to importing
      setStatuses((prev) => ({
        ...prev,
        [platform]: { status: "importing", message: "Starting import..." },
      }));

      // Call Apify social import API
      const request: SocialImportRequest = {
        platform: platform as "youtube" | "instagram" | "facebook" | "linkedin",
        url: url,
      };

      const response = await socialImportService.initiateImport(request);

      // Store jobId for status tracking
      setStatuses((prev) => ({
        ...prev,
        [platform]: {
          status: "importing",
          jobId: response.jobId,
          message: response.message,
        },
      }));

      // Start polling for status
      startStatusPolling(response.jobId, platform);

      showToast(
        `Import Started! Importing ${platform} content... You can close this browser or submit other platforms while we process in the background.`
      );
    } catch (error) {
      setStatuses((prev) => ({
        ...prev,
        [platform]: {
          status: "failed",
          message: error instanceof Error ? error.message : "Import failed",
        },
      }));

      showToast(
        error instanceof Error ? error.message : "Failed to start import"
      );
    }
  };

  const startStatusPolling = (jobId: string, platform: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await socialImportService.getImportStatus(jobId);

        // Update UI with status
        setStatuses((prev) => ({
          ...prev,
          [platform]: {
            status: status.status.toLowerCase() as
              | "idle"
              | "importing"
              | "processing"
              | "completed"
              | "failed",
            jobId,
            message: status.result?.entriesAdded
              ? `${status.result.entriesAdded} items added`
              : status.status,
            entriesAdded: status.result?.entriesAdded,
          },
        }));

        if (status.status === "COMPLETED") {
          clearInterval(interval);
          delete pollingIntervals[platform];
          setPollingIntervals((prev) => {
            const newIntervals = { ...prev };
            delete newIntervals[platform];
            return newIntervals;
          });

          showToast(
            `🎉 ${platform} import complete! ${status.result?.entriesAdded || 0} items added to your knowledge base. Your content is now ready for AI generation!`
          );

          onImportSuccess?.(platform, status.result?.entriesAdded || 0);
        } else if (status.status === "FAILED") {
          clearInterval(interval);
          delete pollingIntervals[platform];
          setPollingIntervals((prev) => {
            const newIntervals = { ...prev };
            delete newIntervals[platform];
            return newIntervals;
          });

          showToast(`${platform} import failed: ${status.errorMessage}`);
        }
      } catch {
        clearInterval(interval);
        delete pollingIntervals[platform];
        setPollingIntervals((prev) => {
          const newIntervals = { ...prev };
          delete newIntervals[platform];
          return newIntervals;
        });

        showToast("Failed to check import status");
      }
    }, 10000); // Poll every 10 seconds

    // Store interval for cleanup
    setPollingIntervals((prev) => ({
      ...prev,
      [platform]: interval,
    }));
  };

  const getStatusIcon = (status: ImportStatus) => {
    switch (status.status) {
      case "importing":
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: ImportStatus) => {
    switch (status.status) {
      case "importing":
        return "Importing...";
      case "processing":
        return "Processing...";
      case "completed":
        return `Complete (${status.entriesAdded} items)`;
      case "failed":
        return "Failed";
      default:
        return "";
    }
  };

  const platforms = [
    {
      key: "youtube",
      icon: Youtube,
      placeholder: "https://youtube.com/channel/UC...",
      label: "YouTube",
    },
    {
      key: "instagram",
      icon: Instagram,
      placeholder: "https://instagram.com/username",
      label: "Instagram",
    },
    {
      key: "facebook",
      icon: Facebook,
      placeholder: "https://facebook.com/pagename",
      label: "Facebook",
    },
    {
      key: "linkedin",
      icon: Linkedin,
      placeholder: "https://linkedin.com/in/username",
      label: "LinkedIn",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 font-['Satoshi'] mb-2">
          Add your socials so Echo can learn your vibe
        </h2>
        <p className="text-gray-600 font-['Satoshi'] mb-4">
          Paste your profile URLs below. We&apos;ll import your content to build
          your knowledge base.
        </p>

        {/* Enhanced User Messaging */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">💡</span>
              </div>
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Pro Tip: You can import multiple platforms at once!
              </h3>
              <p className="text-sm text-blue-700">
                Once you submit an import, you can safely close your browser or
                submit other social platforms. We&apos;ll process everything in
                the background and notify you when complete.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Import Inputs */}
      <div className="space-y-4">
        {platforms.map(({ key, icon: Icon, placeholder }) => {
          const status = statuses[key];
          return (
            <div
              key={key}
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-white"
            >
              <Icon className="text-2xl text-gray-600" />
              <Input
                type="url"
                placeholder={placeholder}
                value={urls[key as keyof typeof urls]}
                onChange={(e) =>
                  setUrls((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="flex-1"
                disabled={
                  status.status === "importing" ||
                  status.status === "processing"
                }
              />
              <Button
                onClick={() =>
                  handleImport(key, urls[key as keyof typeof urls])
                }
                disabled={
                  !urls[key as keyof typeof urls].trim() ||
                  status.status === "importing" ||
                  status.status === "processing"
                }
                className="px-4 py-2 bg-[#3a8e9c] hover:bg-[#2d7a85] text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Import
              </Button>
              {status.status !== "idle" && (
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className="text-sm text-gray-600">
                    {getStatusText(status)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Summary */}
      {Object.values(statuses).some((status) => status.status !== "idle") && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Import Status</h4>
            {Object.values(statuses).filter(
              (s) => s.status === "importing" || s.status === "processing"
            ).length > 1 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Multiple imports running
              </span>
            )}
          </div>
          <div className="space-y-2">
            {platforms.map(({ key, label }) => {
              const status = statuses[key];
              if (status.status !== "idle") {
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span className="text-sm text-gray-600">
                        {getStatusText(status)}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Additional helpful message */}
          {Object.values(statuses).some(
            (s) => s.status === "importing" || s.status === "processing"
          ) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 You can safely close this browser or submit other platforms
                while imports are processing.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
