"use client";

import React, { useState } from "react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
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
  Link,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface SocialImportModalProps {
  onImportSuccess?: (jobId: string) => void;
  children?: React.ReactNode;
}

const platformOptions = [
  {
    value: "youtube",
    label: "YouTube",
    icon: Youtube,
    description: "Import videos from your YouTube channel",
    placeholder: "https://youtube.com/@yourchannel",
    example: "https://youtube.com/@yourchannel",
  },
  {
    value: "instagram",
    label: "Instagram",
    icon: Instagram,
    description: "Import posts from your Instagram profile",
    placeholder: "https://instagram.com/yourusername",
    example: "https://instagram.com/yourusername",
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: Facebook,
    description: "Import posts from your Facebook page",
    placeholder: "https://facebook.com/yourpage",
    example: "https://facebook.com/yourpage",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    description: "Import posts from your LinkedIn profile",
    placeholder: "https://linkedin.com/in/yourusername",
    example: "https://linkedin.com/in/yourusername",
  },
];

export default function SocialImportModal({
  onImportSuccess,
  children,
}: SocialImportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const selectedPlatformOption = platformOptions.find(
    (p) => p.value === selectedPlatform
  );

  const handleSubmit = async () => {
    if (!selectedPlatform || !url) {
      setError("Please select a platform and enter a URL");
      return;
    }

    // Validate URL
    const validation = socialImportService.validateUrl(selectedPlatform, url);
    if (!validation.isValid) {
      setError(validation.error || "Invalid URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: SocialImportRequest = {
        platform: selectedPlatform as
          | "youtube"
          | "instagram"
          | "facebook"
          | "linkedin",
        url,
      };

      const response = await socialImportService.initiateImport(request);

      showToast(`Import Started! ${response.message}`, "success");

      setIsOpen(false);
      setUrl("");
      setSelectedPlatform("");

      if (onImportSuccess) {
        onImportSuccess(response.jobId);
      }
    } catch (error) {
      console.error("Import failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Import failed";
      setError(errorMessage);
      showToast(`Import Failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null);
      setUrl("");
      setSelectedPlatform("");
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white">
            <Link className="h-4 w-4 mr-2" />
            Import Content
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Social Media Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform">Select Platform</Label>
            <Select
              value={selectedPlatform}
              onValueChange={setSelectedPlatform}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a platform..." />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <SelectItem key={platform.value} value={platform.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{platform.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* URL Input */}
          {selectedPlatform && (
            <div className="space-y-2">
              <Label htmlFor="url">
                Enter {selectedPlatformOption?.label} URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder={selectedPlatformOption?.placeholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Example: {selectedPlatformOption?.example}
              </p>
            </div>
          )}

          {/* Platform Description */}
          {selectedPlatformOption && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <selectedPlatformOption.icon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedPlatformOption.label}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {selectedPlatformOption.description}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedPlatform || !url || isLoading}
              className="flex-1 bg-[#3a8e9c] hover:bg-[#2d7a85]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting Import...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Start Import
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
