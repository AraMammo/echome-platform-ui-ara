"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  TrendingUp,
  Clock,
  Users,
  Zap,
} from "lucide-react";
import { ContentKitStatus } from "@/services/content-kit";

interface ContentSuggestionsProps {
  contentKit: ContentKitStatus;
  connectedAccounts: Array<{ platform: string; profileName: string }>;
}

const platformIcons = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  newsletter: Mail,
};

const platformColors = {
  twitter: "text-blue-500",
  linkedin: "text-blue-600",
  facebook: "text-blue-700",
  instagram: "text-pink-500",
  youtube: "text-red-500",
  newsletter: "text-green-500",
};

const platformNames = {
  twitter: "Twitter",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  newsletter: "Newsletter",
};

export default function ContentSuggestions({
  contentKit,
  connectedAccounts,
}: ContentSuggestionsProps) {
  if (!contentKit.outputs) return null;

  const suggestions = [];

  // Analyze content and generate suggestions
  if (contentKit.outputs.linkedInPost) {
    suggestions.push({
      platform: "linkedin",
      content: contentKit.outputs.linkedInPost,
      reason: "Professional content perfect for LinkedIn",
      engagement: "High",
      timing: "Best: 8-10 AM, 12-2 PM",
      audience: "Professional network",
      icon: Linkedin,
      color: "text-blue-600",
    });
  }

  if (contentKit.outputs.tweets && contentKit.outputs.tweets.length > 0) {
    suggestions.push({
      platform: "twitter",
      content: contentKit.outputs.tweets,
      reason: "Thread format ideal for Twitter engagement",
      engagement: "Very High",
      timing: "Best: 9-10 AM, 7-9 PM",
      audience: "Tech-savvy audience",
      icon: Twitter,
      color: "text-blue-500",
    });
  }

  if (contentKit.outputs.facebookPost) {
    suggestions.push({
      platform: "facebook",
      content: contentKit.outputs.facebookPost,
      reason: "Engaging content for Facebook community",
      engagement: "High",
      timing: "Best: 1-3 PM, 3-4 PM",
      audience: "Broad demographic",
      icon: Facebook,
      color: "text-blue-700",
    });
  }

  if (
    contentKit.outputs.instagramCarousel &&
    contentKit.outputs.instagramCarouselImages
  ) {
    suggestions.push({
      platform: "instagram",
      content: contentKit.outputs.instagramCarousel,
      reason: "Visual content with carousel format",
      engagement: "Very High",
      timing: "Best: 11 AM-1 PM, 5-7 PM",
      audience: "Visual learners",
      icon: Instagram,
      color: "text-pink-500",
    });
  }

  if (contentKit.outputs.youtubeScript) {
    suggestions.push({
      platform: "youtube",
      content: contentKit.outputs.youtubeScript,
      reason: "Long-form content perfect for YouTube",
      engagement: "High",
      timing: "Best: 2-4 PM, 8-11 PM",
      audience: "Video content consumers",
      icon: Youtube,
      color: "text-red-500",
    });
  }

  if (contentKit.outputs.newsletter) {
    suggestions.push({
      platform: "newsletter",
      content: contentKit.outputs.newsletter,
      reason: "Direct communication with subscribers",
      engagement: "Very High",
      timing: "Best: Tuesday-Thursday, 10 AM-2 PM",
      audience: "Email subscribers",
      icon: Mail,
      color: "text-green-500",
    });
  }

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "Very High":
        return "bg-green-100 text-green-800";
      case "High":
        return "bg-blue-100 text-blue-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isConnected = (platform: string) => {
    return connectedAccounts.some((acc) => acc.platform === platform);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#3a8e9c]" />
          Smart Posting Suggestions
        </CardTitle>
        <CardDescription>
          AI-powered recommendations for optimal content distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            const connected = isConnected(suggestion.platform);

            return (
              <div
                key={index}
                className={`p-4 border rounded-lg transition-all ${
                  connected
                    ? "border-[#3a8e9c] bg-[#3a8e9c]/5"
                    : "border-stone-200 bg-stone-50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-6 w-6 ${suggestion.color}`} />
                    <div>
                      <h4 className="font-semibold text-zinc-900">
                        {
                          platformNames[
                            suggestion.platform as keyof typeof platformNames
                          ]
                        }
                      </h4>
                      <p className="text-sm text-stone-600">
                        {suggestion.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={getEngagementColor(suggestion.engagement)}
                    >
                      {suggestion.engagement} Engagement
                    </Badge>
                    {connected ? (
                      <Badge className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-stone-500">
                        Not Connected
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-stone-500" />
                    <span className="text-stone-600">Timing:</span>
                    <span className="font-medium">{suggestion.timing}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-stone-500" />
                    <span className="text-stone-600">Audience:</span>
                    <span className="font-medium">{suggestion.audience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-stone-500" />
                    <span className="text-stone-600">Expected Reach:</span>
                    <span className="font-medium">
                      {suggestion.platform === "twitter"
                        ? "High"
                        : suggestion.platform === "linkedin"
                          ? "Medium-High"
                          : suggestion.platform === "facebook"
                            ? "High"
                            : suggestion.platform === "instagram"
                              ? "Very High"
                              : suggestion.platform === "youtube"
                                ? "Medium"
                                : "High"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-stone-500">
                    {Array.isArray(suggestion.content)
                      ? `${suggestion.content.length} tweets in thread`
                      : `${suggestion.content.length} characters`}
                  </div>
                  {connected && (
                    <Button
                      size="sm"
                      className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
                    >
                      Post Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {connectedAccounts.length === 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Connect Your Accounts</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Connect your social media accounts in Settings to enable direct
              posting and get personalized recommendations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
