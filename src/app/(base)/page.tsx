"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import {
  FileText,
  CheckCircle,
  Share2,
  Eye,
  Heart,
  TrendingUp,
  Plus,
  Calendar,
  Clock,
} from "lucide-react";
import {
  databaseContentService,
  GeneratedContent,
} from "@/services/database-content";
import { analyticsService, DashboardStats } from "@/services/analytics";
import OnboardingWizard from "@/components/molecules/onboarding-wizard";

export default function Dashboard() {
  const router = useRouter();
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem(
      "echome_onboarding_completed"
    );
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }

    const fetchGeneratedContent = async () => {
      try {
        setIsLoading(true);
        const response = await databaseContentService.getGeneratedContent({
          limit: 50,
          offset: 0,
        });
        setGeneratedContent(response.content || []);
      } catch (error) {
        console.error("Error fetching generated content:", error);
        setGeneratedContent([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeneratedContent();
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoadingStats(true);
        const stats = await analyticsService.getDashboardStats();
        setDashboardStats(stats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setDashboardStats({
          totalContent: generatedContent.length,
          readyToPost: 0,
          posted: 0,
          totalViews: 0,
          engagement: 0,
          weeklyGrowth: 0,
          contentMetrics: [],
          weeklyActivity: [],
          monthlyTrends: [],
          recentActivity: [],
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, [generatedContent.length]);

  const totalContent = dashboardStats?.totalContent || generatedContent.length;
  const readyToPost = dashboardStats?.readyToPost || 0;
  const posted = dashboardStats?.posted || 0;

  const contentMetrics = [
    {
      title: "Total Content",
      value: totalContent.toString(),
      icon: FileText,
      color: "text-[#3a8e9c]",
      bgColor: "bg-[#3a8e9c]/10",
    },
    {
      title: "Ready to Post",
      value: readyToPost.toString(),
      icon: CheckCircle,
      color: "text-[#9b8baf]",
      bgColor: "bg-[#9b8baf]/10",
    },
    {
      title: "Posted",
      value: posted.toString(),
      icon: Share2,
      color: "text-[#b4a398]",
      bgColor: "bg-[#b4a398]/10",
    },
    {
      title: "Total Views",
      value: dashboardStats?.totalViews
        ? `${(dashboardStats.totalViews / 1000).toFixed(1)}K`
        : "0",
      icon: Eye,
      color: "text-[#3a8e9c]",
      bgColor: "bg-[#3a8e9c]/10",
    },
    {
      title: "Engagement",
      value: dashboardStats?.engagement
        ? `${(dashboardStats.engagement / 1000).toFixed(1)}K`
        : "0",
      icon: Heart,
      color: "text-[#9b8baf]",
      bgColor: "bg-[#9b8baf]/10",
    },
    {
      title: "Weekly Growth",
      value: dashboardStats?.weeklyGrowth
        ? `+${dashboardStats.weeklyGrowth}%`
        : "0%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  const weeklyData = dashboardStats?.weeklyActivity?.length
    ? dashboardStats.weeklyActivity.map((item) => ({
        name: new Date(item.date).toLocaleDateString("en", {
          weekday: "short",
        }),
        content: item.content,
        views: item.views,
        engagement: item.engagement,
      }))
    : [];

  const monthlyData = dashboardStats?.monthlyTrends?.length
    ? dashboardStats.monthlyTrends.map((item) => ({
        name: item.month,
        content: item.content,
        views: item.views,
        engagement: item.engagement,
      }))
    : [];

  const quickActions = [
    {
      title: "Content Creator Kit",
      description:
        "Upload videos or audio files to generate complete content packages",
      tooltip: "Accepts: Video files (MP4, MOV), Audio files (MP3, WAV, M4A)",
      icon: Plus,
      color: "bg-[#3a8e9c]",
      action: () => router.push("/create"),
    },
    {
      title: "Ideas-to-Content",
      description:
        "Type a prompt or record a voice note to create content instantly",
      tooltip: "Accepts: Text prompts, Voice recordings, Quick ideas",
      icon: FileText,
      color: "bg-[#9b8baf]",
      action: () => router.push("/create"),
    },
    {
      title: "Repurpose Engine",
      description:
        "Import content from social media URLs to repurpose automatically",
      tooltip: "Accepts: YouTube, TikTok, Instagram, LinkedIn, Article URLs",
      icon: Share2,
      color: "bg-[#b4a398]",
      action: () => router.push("/auto-clone"),
    },
  ];

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#1c1c1e] font-['Satoshi'] mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-[#9b8baf] font-['Satoshi'] mb-1">
              Manage and track your Echosystem in one place.
            </p>
            <p className="text-sm text-[#3a8e9c] font-medium font-['Satoshi']">
              Unmute Yourself.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-[#d5d2cc] text-[#1c1c1e] hover:shadow-md hover:border-[#3a8e9c] transition-all"
              onClick={() => router.push("/schedule")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-6 border border-[#d5d2cc]">
          <h3 className="text-lg font-semibold text-[#1c1c1e] font-['Satoshi'] mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                className="w-full justify-start h-auto p-3 border-[#d5d2cc] text-[#1c1c1e] hover:shadow-md hover:border-[#3a8e9c] transition-all"
                variant="outline"
                size="sm"
                onClick={action.action}
                title={action.tooltip}
              >
                <div className="flex items-center gap-3 w-full">
                  <div
                    className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center shrink-0`}
                  >
                    <action.icon size={16} className="text-white" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium break-words">
                      {action.title}
                    </div>
                    <div className="text-xs text-[#9b8baf] line-clamp-2 break-words">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoadingStats
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-[20px] p-6 border border-[#d5d2cc] animate-pulse"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-[12px]"></div>
                    <div className="w-8 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-16 h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                </div>
              ))
            : contentMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="bg-white rounded-[20px] p-6 border border-[#d5d2cc] hover:border-[#3a8e9c] transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-12 h-12 ${metric.bgColor} rounded-[12px] flex items-center justify-center`}
                    >
                      <metric.icon size={24} className={metric.color} />
                    </div>
                  </div>
                  <div
                    className={`text-3xl font-bold ${metric.color} font-['Satoshi'] mb-2`}
                  >
                    {metric.value}
                  </div>
                  <p className="text-[#1c1c1e] font-['Satoshi'] font-medium">
                    {metric.title}
                  </p>
                </div>
              ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-[20px] p-6 border border-[#d5d2cc]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1c1c1e] font-['Satoshi']">
                Weekly Content Activity
              </h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#3a8e9c]"></div>
                  <span className="text-sm text-[#9b8baf]">Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#9b8baf]"></div>
                  <span className="text-sm text-[#9b8baf]">Views</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {weeklyData.length > 0 ? (
                weeklyData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <div
                        className="w-8 bg-[#3a8e9c] rounded-t-sm"
                        style={{ height: `${(day.content / 18) * 120}px` }}
                      ></div>
                      <div
                        className="w-8 bg-[#9b8baf] rounded-t-sm"
                        style={{ height: `${(day.views / 4.5) * 120}px` }}
                      ></div>
                    </div>
                    <span className="text-xs text-[#9b8baf] font-medium">
                      {day.name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-[#9b8baf] text-sm">
                    No weekly activity data available
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-6 border border-[#d5d2cc]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1c1c1e] font-['Satoshi']">
                Monthly Trends
              </h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#b4a398]"></div>
                  <span className="text-sm text-[#9b8baf]">Engagement</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {monthlyData.length > 0 ? (
                monthlyData.map((month, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div
                      className="w-10 bg-[#b4a398] rounded-t-sm"
                      style={{ height: `${(month.engagement / 7.1) * 200}px` }}
                    ></div>
                    <span className="text-xs text-[#9b8baf] font-medium">
                      {month.name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-[#9b8baf] text-sm">
                    No monthly trends data available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-8 border border-[#d5d2cc] max-h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#1c1c1e] font-['Satoshi']">
              Recently Generated Content
            </h3>
            <Button
              className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] px-6 py-3 rounded-[12px] transition-colors"
              onClick={() => router.push("/create")}
            >
              <Plus size={18} className="mr-2" />
              Create New Content
            </Button>
          </div>

          <div
            className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {isLoading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-4 border-[#3a8e9c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#9b8baf]">Loading content...</p>
              </div>
            ) : generatedContent.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-[#f3f1ec] rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText size={48} className="text-[#9b8baf]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1c1c1e] font-['Satoshi'] mb-2">
                  No content yet. Start by creating your first piece.
                </h3>
              </div>
            ) : (
              <div className="space-y-4 pr-2">
                {generatedContent.map((item) => (
                  <div
                    key={item.id}
                    className="border border-[#d5d2cc] rounded-[12px] p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-[#3a8e9c]/10 text-[#3a8e9c] text-xs font-medium rounded-full">
                            {item.contentType
                              ?.replace("_", " ")
                              .toUpperCase() || "GENERATED"}
                          </span>
                          <span className="text-xs text-[#9b8baf]">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-medium text-[#1c1c1e] mb-2">
                          {item.title ||
                            `Generated Content - ${item.contentType?.replace("_", " ")}`}
                        </h4>
                        <p className="text-sm text-[#6b7280] line-clamp-3">
                          {item.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() => router.push("/schedule")}
                          title="Schedule this content"
                        >
                          <Clock size={16} className="text-[#3a8e9c]" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-6 right-6">
          <div className="w-16 h-16 bg-[#d5d2cc] rounded-full flex items-center justify-center opacity-60">
            <div className="w-8 h-8 bg-[#9b8baf] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Onboarding Wizard */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
        onSkip={() => {
          localStorage.setItem("echome_onboarding_skipped", "true");
          setShowOnboarding(false);
        }}
      />
    </div>
  );
}
