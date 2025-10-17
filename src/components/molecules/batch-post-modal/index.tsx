"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Textarea } from "@/components/atoms/textarea";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Loader2,
  Share2,
} from "lucide-react";
import { useToast } from "@/components/atoms/toast/use-toast";
import { oauthService, ConnectedAccount } from "@/services/oauth";

interface BatchPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType:
    | "tweet"
    | "linkedin"
    | "facebook"
    | "blog"
    | "instagram"
    | "newsletter";
  content: string | string[];
  mediaUrls?: string[];
}

const platformIcons = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
};

const platformNames = {
  twitter: "Twitter",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
};

export default function BatchPostModal({
  isOpen,
  onClose,
  contentType,
  content,
  mediaUrls,
}: BatchPostModalProps) {
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [customContent, setCustomContent] = useState<Record<string, string>>(
    {}
  );
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchConnectedAccounts();
    }
  }, [isOpen]);

  const fetchConnectedAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await oauthService.getConnectedAccounts();
      setConnectedAccounts(response.connectedAccounts);

      // Initialize custom content with original content
      const initialContent: Record<string, string> = {};
      response.connectedAccounts.forEach((account) => {
        if (Array.isArray(content)) {
          initialContent[account.platform] = content.join("\n");
        } else {
          initialContent[account.platform] = content;
        }
      });
      setCustomContent(initialContent);
    } catch (error) {
      console.error("Error fetching connected accounts:", error);
      toast({
        title: "Error Loading Accounts",
        description: "Failed to load connected accounts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleContentChange = (platform: string, newContent: string) => {
    setCustomContent((prev) => ({
      ...prev,
      [platform]: newContent,
    }));
  };

  const handleBatchPost = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No Platforms Selected",
        description: "Please select at least one platform to post to.",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    const results = [];

    try {
      for (const platform of selectedPlatforms) {
        const platformContent = customContent[platform];

        if (platform === "twitter") {
          const isThread = platformContent.includes("\n");
          await oauthService.postToTwitter({
            text: platformContent,
            mediaUrls,
            isThread,
          });
        } else if (platform === "linkedin") {
          await oauthService.postToLinkedIn({
            text: platformContent,
            mediaUrls,
            visibility: "PUBLIC",
          });
        } else if (platform === "facebook" || platform === "instagram") {
          await oauthService.postToMeta({
            text: platformContent,
            mediaUrls: mediaUrls,
            platform,
          });
        }

        results.push({ platform, success: true });
      }

      toast({
        title: "Batch Post Successful! 🎉",
        description: `Posted to ${results.length} platform${results.length > 1 ? "s" : ""} successfully.`,
      });

      onClose();
    } catch (error) {
      console.error("Error in batch posting:", error);
      toast({
        title: "Batch Post Failed",
        description:
          "Some posts may have failed. Please check your connections.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const getAvailablePlatforms = () => {
    return connectedAccounts.filter((account) => {
      // Filter based on content type compatibility
      if (contentType === "tweet" && account.platform === "twitter")
        return true;
      if (contentType === "linkedin" && account.platform === "linkedin")
        return true;
      if (contentType === "facebook" && account.platform === "facebook")
        return true;
      if (contentType === "instagram" && account.platform === "instagram")
        return true;
      if (contentType === "blog" || contentType === "newsletter") {
        // Blog/newsletter can be posted to LinkedIn, Facebook, or Twitter
        return ["linkedin", "facebook", "twitter"].includes(account.platform);
      }
      return false;
    });
  };

  const availablePlatforms = getAvailablePlatforms();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Share2 className="h-6 w-6" />
            Batch Post to Social Media
          </DialogTitle>
          <DialogDescription className="text-stone-600">
            Post your content to multiple platforms at once. Customize the
            content for each platform.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#3a8e9c]" />
            <span className="ml-2 text-stone-600">
              Loading connected accounts...
            </span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Platform Selection */}
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-3">
                Select Platforms
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availablePlatforms.map((account) => {
                  const Icon =
                    platformIcons[
                      account.platform as keyof typeof platformIcons
                    ];
                  const isSelected = selectedPlatforms.includes(
                    account.platform
                  );

                  return (
                    <div
                      key={account.platform}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#3a8e9c] bg-[#3a8e9c]/10"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                      onClick={() => handlePlatformToggle(account.platform)}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={isSelected}
                          onChange={() =>
                            handlePlatformToggle(account.platform)
                          }
                        />
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {
                            platformNames[
                              account.platform as keyof typeof platformNames
                            ]
                          }
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">
                        @{account.profileName}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content Customization */}
            {selectedPlatforms.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-3">
                  Customize Content for Each Platform
                </h3>
                <div className="space-y-4">
                  {selectedPlatforms.map((platform) => {
                    const Icon =
                      platformIcons[platform as keyof typeof platformIcons];
                    const account = connectedAccounts.find(
                      (acc) => acc.platform === platform
                    );

                    return (
                      <div
                        key={platform}
                        className="border border-stone-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">
                            {
                              platformNames[
                                platform as keyof typeof platformNames
                              ]
                            }
                          </span>
                          <span className="text-sm text-stone-600">
                            @{account?.profileName}
                          </span>
                        </div>
                        <Textarea
                          value={customContent[platform] || ""}
                          onChange={(e) =>
                            handleContentChange(platform, e.target.value)
                          }
                          placeholder={`Customize content for ${platformNames[platform as keyof typeof platformNames]}...`}
                          rows={4}
                          className="w-full"
                        />
                        <div className="text-xs text-stone-500 mt-1">
                          {customContent[platform]?.length || 0} characters
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
          <Button variant="outline" onClick={onClose} disabled={isPosting}>
            Cancel
          </Button>
          <Button
            onClick={handleBatchPost}
            disabled={isPosting || selectedPlatforms.length === 0}
            className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
          >
            {isPosting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Post to {selectedPlatforms.length} Platform
                {selectedPlatforms.length > 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
