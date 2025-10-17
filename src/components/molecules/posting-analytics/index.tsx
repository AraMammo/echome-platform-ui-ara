"use client";

import React, { useState, useEffect } from "react";
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
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Calendar,
  BarChart3,
  ExternalLink,
} from "lucide-react";

interface PostingAnalyticsProps {
  connectedAccounts: Array<{ platform: string; profileName: string }>;
}

// Mock analytics data - in a real app, this would come from your analytics API
const mockAnalytics = {
  totalPosts: 24,
  totalReach: 15420,
  totalEngagement: 892,
  engagementRate: 5.8,
  bestPerformingPlatform: "linkedin",
  recentPosts: [
    {
      id: 1,
      platform: "linkedin",
      content: "The future of AI in content creation...",
      reach: 1200,
      engagement: 89,
      engagementRate: 7.4,
      postedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      platform: "twitter",
      content: "Thread: 5 ways to improve your content strategy...",
      reach: 800,
      engagement: 45,
      engagementRate: 5.6,
      postedAt: "2024-01-14T14:20:00Z",
    },
    {
      id: 3,
      platform: "facebook",
      content: "How to build a personal brand online...",
      reach: 600,
      engagement: 32,
      engagementRate: 5.3,
      postedAt: "2024-01-13T16:45:00Z",
    },
  ],
  platformStats: {
    linkedin: { posts: 8, avgReach: 1100, avgEngagement: 78 },
    twitter: { posts: 10, avgReach: 750, avgEngagement: 42 },
    facebook: { posts: 6, avgReach: 650, avgEngagement: 35 },
  },
};

const platformIcons = {
  linkedin: "💼",
  twitter: "🐦",
  facebook: "📘",
  instagram: "📷",
};

const platformNames = {
  linkedin: "LinkedIn",
  twitter: "Twitter",
  facebook: "Facebook",
  instagram: "Instagram",
};

export default function PostingAnalytics({
  connectedAccounts,
}: PostingAnalyticsProps) {
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [isLoading, setIsLoading] = useState(false);

  // In a real app, you'd fetch this data from your analytics API
  useEffect(() => {
    // Simulate loading analytics data
    setIsLoading(true);
    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 7) return "text-green-600";
    if (rate >= 5) return "text-blue-600";
    if (rate >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  if (connectedAccounts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#3a8e9c]" />
            Posting Analytics
          </CardTitle>
          <CardDescription>
            Track your social media performance and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              No Analytics Data Yet
            </h3>
            <p className="text-stone-600 mb-4">
              Connect your social media accounts and start posting to see your
              performance analytics.
            </p>
            <Button className="bg-[#3a8e9c] hover:bg-[#2d7a85]">
              Connect Accounts
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#3a8e9c]" />
          Posting Analytics
        </CardTitle>
        <CardDescription>
          Your social media performance over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3a8e9c]"></div>
            <span className="ml-2 text-stone-600">Loading analytics...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <div className="text-2xl font-bold text-[#3a8e9c]">
                  {analytics.totalPosts}
                </div>
                <div className="text-sm text-stone-600">Total Posts</div>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <div className="text-2xl font-bold text-[#3a8e9c]">
                  {analytics.totalReach.toLocaleString()}
                </div>
                <div className="text-sm text-stone-600">Total Reach</div>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <div className="text-2xl font-bold text-[#3a8e9c]">
                  {analytics.totalEngagement}
                </div>
                <div className="text-sm text-stone-600">Engagements</div>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <div
                  className={`text-2xl font-bold ${getEngagementColor(analytics.engagementRate)}`}
                >
                  {analytics.engagementRate}%
                </div>
                <div className="text-sm text-stone-600">Engagement Rate</div>
              </div>
            </div>

            {/* Platform Performance */}
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-3">
                Platform Performance
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.platformStats).map(
                  ([platform, stats]) => (
                    <div
                      key={platform}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {
                            platformIcons[
                              platform as keyof typeof platformIcons
                            ]
                          }
                        </span>
                        <div>
                          <div className="font-medium">
                            {
                              platformNames[
                                platform as keyof typeof platformNames
                              ]
                            }
                          </div>
                          <div className="text-sm text-stone-600">
                            {stats.posts} posts
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {stats.avgReach.toLocaleString()} avg reach
                        </div>
                        <div className="text-sm text-stone-600">
                          {stats.avgEngagement} avg engagement
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Recent Posts */}
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-3">
                Recent Posts
              </h3>
              <div className="space-y-3">
                {analytics.recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 border border-stone-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {
                            platformIcons[
                              post.platform as keyof typeof platformIcons
                            ]
                          }
                        </span>
                        <span className="font-medium">
                          {
                            platformNames[
                              post.platform as keyof typeof platformNames
                            ]
                          }
                        </span>
                        <Badge className="bg-stone-100 text-stone-700">
                          {formatDate(post.postedAt)}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-stone-700 mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-stone-500" />
                        <span>{post.reach.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-stone-500" />
                        <span>{post.engagement}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-stone-500" />
                        <span
                          className={getEngagementColor(post.engagementRate)}
                        >
                          {post.engagementRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                💡 Performance Insights
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • LinkedIn posts perform best with 7.4% average engagement
                </li>
                <li>• Posting between 10-11 AM gets the highest reach</li>
                <li>
                  • Thread-style content on Twitter shows 15% higher engagement
                </li>
                <li>• Your engagement rate is 23% above industry average</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
