"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/atoms/dropdown-menu";
import { useToast } from "@/components/atoms/toast/use-toast";
import { oauthService, ConnectedAccount } from "@/services/oauth";
import {
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Loader2,
} from "lucide-react";

interface SocialPostButtonProps {
  contentType:
    | "tweet"
    | "linkedin"
    | "facebook"
    | "blog"
    | "instagram"
    | "newsletter";
  content: string | string[];
  mediaUrls?: string[];
  disabled?: boolean;
}

export default function SocialPostButton({
  contentType,
  content,
  mediaUrls,
  disabled,
}: SocialPostButtonProps) {
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [isPosting, setIsPosting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnectedAccounts();
  }, []);

  const fetchConnectedAccounts = async () => {
    try {
      const response = await oauthService.getConnectedAccounts();
      setConnectedAccounts(response.connectedAccounts);
    } catch (error: unknown) {
      console.error("Error fetching connected accounts:", error);
    }
  };

  const handlePost = async (
    platform: "twitter" | "linkedin" | "facebook" | "instagram"
  ) => {
    if (!connectedAccounts.some((acc) => acc.platform === platform)) {
      toast({
        title: "Account Not Connected",
        description: `Please connect your ${platform} account in Settings first.`,
        variant: "destructive",
      });
      return;
    }

    setIsPosting(platform);

    try {
      let text = "";
      if (Array.isArray(content)) {
        text = content.join("\n");
      } else {
        text = content;
      }

      if (platform === "twitter") {
        const isThread = Array.isArray(content) && content.length > 1;
        await oauthService.postToTwitter({
          text,
          mediaUrls,
          isThread,
        });
      } else if (platform === "linkedin") {
        await oauthService.postToLinkedIn({
          text,
          mediaUrls,
          visibility: "PUBLIC",
        });
      } else if (platform === "facebook" || platform === "instagram") {
        await oauthService.postToMeta({
          text,
          mediaUrls: mediaUrls,
          platform,
        });
      }

      toast({
        title: "Posted Successfully! 🎉",
        description: `Your content has been posted to ${platform}.`,
      });
    } catch (error: unknown) {
      console.error(`Error posting to ${platform}:`, error);

      if (
        (error as { response?: { data?: { needsAuth?: boolean } } })?.response
          ?.data?.needsAuth
      ) {
        toast({
          title: "Reconnect Required",
          description: `Please reconnect your ${platform} account in Settings.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Post Failed",
          description:
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ||
            (error instanceof Error
              ? error.message
              : `Failed to post to ${platform}`),
          variant: "destructive",
        });
      }
    } finally {
      setIsPosting(null);
    }
  };

  const getAvailablePlatforms = () => {
    const platforms: Array<{
      key: "twitter" | "linkedin" | "facebook" | "instagram";
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      supported: boolean;
    }> = [
      {
        key: "twitter",
        icon: Twitter,
        label: "Twitter / X",
        supported: ["tweet"].includes(contentType),
      },
      {
        key: "linkedin",
        icon: Linkedin,
        label: "LinkedIn",
        supported: ["linkedin", "blog"].includes(contentType),
      },
      {
        key: "facebook",
        icon: Facebook,
        label: "Facebook",
        supported: ["facebook", "blog"].includes(contentType),
      },
      {
        key: "instagram",
        icon: Instagram,
        label: "Instagram",
        supported: Boolean(
          ["instagram"].includes(contentType) &&
            mediaUrls &&
            mediaUrls.length > 0
        ),
      },
    ];

    return platforms.filter(
      (p) =>
        p.supported && connectedAccounts.some((acc) => acc.platform === p.key)
    );
  };

  const availablePlatforms = getAvailablePlatforms();

  if (availablePlatforms.length === 0) {
    return null; // Don't show button if no platforms are available
  }

  if (disabled) {
    return (
      <Button disabled variant="outline" size="sm">
        <Share2 className="h-4 w-4 mr-2" />
        Post to Social
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-[#3a8e9c] text-[#3a8e9c] hover:bg-[#3a8e9c]/10"
        >
          {isPosting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Share2 className="h-4 w-4 mr-2" />
          )}
          Post to Social
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availablePlatforms.map((platform) => {
          const Icon = platform.icon;
          const isCurrentlyPosting = isPosting === platform.key;

          return (
            <DropdownMenuItem
              key={platform.key}
              onClick={() => handlePost(platform.key)}
              disabled={!!isPosting}
              className="cursor-pointer"
            >
              {isCurrentlyPosting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Icon className="h-4 w-4 mr-2" />
              )}
              Post to {platform.label}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => (window.location.href = "/settings")}
          className="cursor-pointer text-stone-600"
        >
          Manage Connections
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
