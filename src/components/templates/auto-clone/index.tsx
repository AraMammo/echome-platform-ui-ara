"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import {
  Plus,
  Monitor,
  Bot,
  Activity,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  repurposeEngineService,
  MonitoredCreator,
} from "@/services/repurposeEngineService";
import { useToast } from "@/components/atoms/toast";

export default function RepurposeEngineTemplate() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState("creators");
  const [urlInput, setUrlInput] = useState("");
  const [autoCreateKits, setAutoCreateKits] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(3600);
  const [isLoading, setIsLoading] = useState(false);
  const [monitoredCreators, setMonitoredCreators] = useState<
    MonitoredCreator[]
  >([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);
  const [pollingStatus, setPollingStatus] = useState<{
    isRunning: boolean;
    pollFrequency: number;
    creatorsDueForPolling: number;
    totalCreators: number;
  } | null>(null);
  const [recentActivity, setRecentActivity] = useState<
    Array<{
      id: string;
      creatorId: string;
      extractedData?: {
        title: string;
        description: string;
        summary?: string;
        thumbnailUrl?: string;
        author?: {
          displayName: string;
          username: string;
        };
      };
      status: "success" | "error";
      errorMessage?: string;
      newContentDetected: number;
      extractedAt: string;
      creator?: {
        name?: string;
        username?: string;
        platform: string;
      };
      url?: string;
      processingTime?: number;
      contentHash?: string;
    }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingCreators(true);
        const [creators, status, activity] = await Promise.all([
          repurposeEngineService.getMonitoredCreators(),
          repurposeEngineService.getPollingStatus(),
          repurposeEngineService.getRecentActivity(10),
        ]);
        setMonitoredCreators(creators);
        setPollingStatus(status);
        setRecentActivity(activity);
      } catch (err) {
        console.error("Error fetching data:", err);
        setMonitoredCreators([]);
        setPollingStatus(null);
        setRecentActivity([]);
      } finally {
        setIsLoadingCreators(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      value: monitoredCreators.filter(
        (creator) => creator.automationEnabled === 1
      ).length,
      label: "Active Creators",
      icon: Monitor,
    },
    {
      value: monitoredCreators.filter(
        (creator) => creator.automationEnabled === 1
      ).length,
      label: "Active Automation",
      icon: Activity,
    },
    {
      value: pollingStatus?.creatorsDueForPolling || 0,
      label: "Due for Polling",
      icon: Clock,
    },
  ];

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      error("Please enter a URL");
      return;
    }

    if (!repurposeEngineService.validateUrl(urlInput.trim())) {
      error("Invalid URL format");
      return;
    }

    const detectedPlatform = repurposeEngineService.detectPlatform(
      urlInput.trim()
    );
    if (!detectedPlatform) {
      error(
        "Unsupported platform. Supported platforms: YouTube, TikTok, Instagram, LinkedIn, Articles"
      );
      return;
    }

    setIsLoading(true);
    try {
      const creator = await repurposeEngineService.createMonitoredCreator({
        url: urlInput.trim(),
        platform: detectedPlatform,
        automationEnabled: autoCreateKits ? 1 : 0,
        pollingInterval: pollingInterval,
      });

      success(
        `Successfully added ${creator.creatorName || detectedPlatform} creator to monitoring!`
      );
      setUrlInput("");

      const [creators, status] = await Promise.all([
        repurposeEngineService.getMonitoredCreators(),
        repurposeEngineService.getPollingStatus(),
      ]);
      setMonitoredCreators(creators);
      setPollingStatus(status);
    } catch (err) {
      console.error("Error adding creator:", err);
      error("Failed to add creator. Please check the URL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCreator = async (
    creatorId: string,
    creatorName: string
  ) => {
    try {
      await repurposeEngineService.deleteMonitoredCreator(creatorId);
      success(`Successfully removed ${creatorName} from monitoring!`);

      const [creators, status] = await Promise.all([
        repurposeEngineService.getMonitoredCreators(),
        repurposeEngineService.getPollingStatus(),
      ]);
      setMonitoredCreators(creators);
      setPollingStatus(status);
    } catch {
      error("Failed to delete creator. Please try again.");
    }
  };

  const handleManualPoll = async (creatorId: string, creatorName: string) => {
    try {
      await repurposeEngineService.manualPollCreator(creatorId);
      success(`Successfully polled ${creatorName} for new content!`);

      const [creators, status, activity] = await Promise.all([
        repurposeEngineService.getMonitoredCreators(),
        repurposeEngineService.getPollingStatus(),
        repurposeEngineService.getRecentActivity(10),
      ]);
      setMonitoredCreators(creators);
      setPollingStatus(status);
      setRecentActivity(activity);
    } catch (err) {
      console.error("Error manually polling creator:", err);
      error("Failed to poll creator. Please try again.");
    }
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-zinc-900 font-['Satoshi'] mb-4">
            Repurpose Engine - automate content from creators you follow.
          </h1>
          <p className="text-xl text-stone-700 font-['Satoshi'] leading-relaxed max-w-3xl mx-auto mb-2">
            Auto-generate full kits whenever your monitored creators post new
            videos. Works best with long-form content like YouTube. Your
            Echosystem learns from every creator you follow.
          </p>
          <p className="text-sm text-[#3a8e9c] font-medium font-['Satoshi']">
            Unmute Yourself.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-[20px] p-8 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200 text-center"
            >
              <div className="w-16 h-16 bg-stone-100 rounded-[16px] flex items-center justify-center mx-auto mb-4">
                <stat.icon size={32} className="text-primary" />
              </div>
              <div className="text-4xl font-bold text-zinc-900 font-['Satoshi'] mb-2">
                {stat.value}
              </div>
              <p className="text-stone-600 font-['Satoshi'] font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[20px] p-8 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200 mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900 font-['Satoshi'] mb-6 flex items-center gap-3">
            <Plus size={28} className="text-primary" />
            Add Creator to Monitor
          </h2>

          <form onSubmit={handleAddCreator} className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-700 font-['Satoshi'] mb-2">
                  Paste URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste URL to channel, post, or article. Echo auto-detects platform."
                  className="w-full h-12 px-4 bg-stone-50 rounded-[12px] border border-stone-200 focus:border-[#3a8e9c] focus:ring-2 focus:ring-[#3a8e9c]/20 outline-none font-['Satoshi'] placeholder:text-stone-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 px-6 rounded-[12px] bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] disabled:bg-stone-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Adding..." : "Add Source"}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-stone-700 font-['Satoshi']">
                Polling Interval:
              </label>
              <Select
                value={pollingInterval.toString()}
                onValueChange={(value) => setPollingInterval(Number(value))}
              >
                <SelectTrigger className="w-[180px] h-10 border-stone-200 text-zinc-900 font-['Satoshi']">
                  <SelectValue placeholder="Select interval..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1800">30 minutes</SelectItem>
                  <SelectItem value="3600">1 hour</SelectItem>
                  <SelectItem value="7200">2 hours</SelectItem>
                  <SelectItem value="14400">4 hours</SelectItem>
                  <SelectItem value="86400">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>

          <div className="mt-6 p-4 bg-stone-50 rounded-[12px] border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-stone-700 font-['Satoshi'] mb-1">
                  Automation Options
                </h3>
                <p className="text-xs text-stone-500 font-['Satoshi']">
                  {autoCreateKits
                    ? "Auto-create kits for each new video"
                    : "Notify me before generating"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoCreateKits(!autoCreateKits)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoCreateKits ? "bg-[#3a8e9c]" : "bg-stone-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoCreateKits ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8 mb-8 border-b border-stone-200">
          <button
            onClick={() => setActiveTab("creators")}
            className={`flex items-center gap-2 pb-4 font-medium font-['Satoshi'] transition-colors ${
              activeTab === "creators"
                ? "text-zinc-900 border-b-2 border-zinc-900"
                : "text-stone-600 hover:text-stone-800"
            }`}
          >
            <Monitor size={20} />
            Creators
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-2 pb-4 font-medium font-['Satoshi'] transition-colors ${
              activeTab === "activity"
                ? "text-zinc-900 border-b-2 border-zinc-900"
                : "text-stone-600 hover:text-stone-800"
            }`}
          >
            <Activity size={20} />
            Recent Activity
          </button>
        </div>

        {activeTab === "creators" && (
          <div className="bg-white rounded-[20px] p-8 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200 max-h-[600px] flex flex-col">
            <h2 className="text-2xl font-semibold text-zinc-900 font-['Satoshi'] mb-6">
              Monitored Creators
            </h2>

            <div
              className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {isLoadingCreators ? (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-4 border-[#3a8e9c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-stone-500 font-['Satoshi']">
                    Loading creators...
                  </p>
                </div>
              ) : monitoredCreators.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bot size={48} className="text-primary" />
                  </div>
                  <p className="text-stone-500 font-['Satoshi'] text-lg mb-2">
                    Paste a channel link to start monitoring. Echo will generate
                    content in your voice whenever new posts appear.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pr-2">
                  {monitoredCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className="border border-stone-200 rounded-[12px] p-6 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {creator.extractedData?.thumbnailUrl && (
                          <div className="flex-shrink-0">
                            <img
                              src={creator.extractedData.thumbnailUrl}
                              alt={
                                creator.extractedData.title ||
                                creator.creatorName
                              }
                              className="w-16 h-16 rounded-full object-cover border-2 border-stone-200"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-[#3a8e9c]/10 text-[#3a8e9c] text-xs font-medium rounded-full">
                              {repurposeEngineService
                                .getPlatformDisplayName(creator.platform)
                                .toUpperCase()}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                creator.automationEnabled === 1
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {creator.automationEnabled === 1
                                ? "ACTIVE"
                                : "INACTIVE"}
                            </span>
                            <span className="text-xs text-stone-500">
                              Added{" "}
                              {new Date(creator.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="mb-3">
                            <h4 className="font-semibold text-zinc-900 text-lg mb-1">
                              {creator.extractedData?.title ||
                                creator.creatorName ||
                                "Unknown Creator"}
                            </h4>
                            {creator.extractedData?.author?.displayName &&
                              creator.extractedData.author.displayName !==
                                creator.extractedData.title && (
                                <p className="text-sm text-stone-600 mb-1">
                                  {creator.extractedData.author.displayName}
                                </p>
                              )}
                            <p className="text-xs text-stone-500 break-all">
                              {creator.url}
                            </p>
                          </div>

                          {creator.extractedData?.summary && (
                            <div className="mb-3">
                              <p className="text-sm text-stone-700 line-clamp-2">
                                {creator.extractedData.summary}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-stone-500 mb-3">
                            <div>
                              <span className="font-medium text-stone-600">
                                Checks:
                              </span>
                              <span className="ml-1">
                                {creator.totalChecks}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-stone-600">
                                Success:
                              </span>
                              <span className="ml-1">
                                {creator.successfulChecks}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-stone-600">
                                Interval:
                              </span>
                              <span className="ml-1">
                                {Math.round(creator.pollingInterval / 3600)}h
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-stone-600">
                                Next Check:
                              </span>
                              <span className="ml-1">
                                {creator.nextCheck
                                  ? new Date(creator.nextCheck).toLocaleString()
                                  : "N/A"}
                              </span>
                            </div>
                          </div>

                          {creator.lastChecked && (
                            <div className="text-xs text-stone-500">
                              <span className="font-medium text-stone-600">
                                Last Check:
                              </span>
                              <span className="ml-1">
                                {new Date(creator.lastChecked).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2"
                            onClick={() =>
                              handleManualPoll(
                                creator.id,
                                creator.creatorName || "Creator"
                              )
                            }
                            title="Manual Poll"
                          >
                            <RefreshCw size={16} className="text-stone-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 hover:bg-red-50"
                            onClick={() =>
                              handleDeleteCreator(
                                creator.id,
                                creator.creatorName || "Creator"
                              )
                            }
                            title="Delete Creator"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-white rounded-[20px] p-8 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200 max-h-[600px] flex flex-col">
            <h2 className="text-2xl font-semibold text-zinc-900 font-['Satoshi'] mb-6">
              Recent Activity
            </h2>

            <div
              className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {recentActivity.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity size={48} className="text-primary" />
                  </div>
                  <p className="text-stone-500 font-['Satoshi'] text-lg mb-2">
                    No recent activity yet
                  </p>
                  <p className="text-sm text-stone-400 font-['Satoshi']">
                    Activity will appear here when creators are polled for new
                    content
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pr-2">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="border border-stone-200 rounded-[12px] p-6 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {activity.extractedData?.thumbnailUrl && (
                          <div className="flex-shrink-0">
                            <img
                              src={activity.extractedData.thumbnailUrl}
                              alt={activity.extractedData.title || "Content"}
                              className="w-16 h-16 rounded-lg object-cover border-2 border-stone-200"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-[#3a8e9c]/10 text-[#3a8e9c] text-xs font-medium rounded-full">
                              {repurposeEngineService
                                .getPlatformDisplayName(
                                  activity.creator?.platform || "unknown"
                                )
                                .toUpperCase()}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                activity.status === "success"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {activity.status === "success" ? (
                                <>
                                  <CheckCircle
                                    size={12}
                                    className="inline mr-1"
                                  />
                                  SUCCESS
                                </>
                              ) : (
                                <>
                                  <XCircle size={12} className="inline mr-1" />
                                  ERROR
                                </>
                              )}
                            </span>
                            {activity.newContentDetected === 1 && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                ✨ NEW CONTENT
                              </span>
                            )}
                            <span className="text-xs text-stone-500">
                              {new Date(activity.extractedAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="mb-3">
                            <h4 className="font-semibold text-zinc-900 text-lg mb-1">
                              {activity.extractedData?.title ||
                                "Unknown Content"}
                            </h4>
                            <p className="text-sm text-stone-600 mb-1">
                              From:{" "}
                              {activity.creator?.name ||
                                activity.creator?.username ||
                                "Unknown Creator"}
                            </p>
                            <p className="text-xs text-stone-500 break-all">
                              {activity.url}
                            </p>
                          </div>

                          {activity.extractedData?.summary && (
                            <div className="mb-3">
                              <p className="text-sm text-stone-700 line-clamp-3">
                                {activity.extractedData.summary}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-stone-500">
                            {activity.processingTime && (
                              <span>
                                <span className="font-medium text-stone-600">
                                  Processed in:
                                </span>
                                <span className="ml-1">
                                  {(activity.processingTime / 1000).toFixed(1)}s
                                </span>
                              </span>
                            )}
                            {activity.contentHash && (
                              <span>
                                <span className="font-medium text-stone-600">
                                  Hash:
                                </span>
                                <span className="ml-1 font-mono">
                                  {activity.contentHash.substring(0, 8)}...
                                </span>
                              </span>
                            )}
                          </div>

                          {activity.errorMessage && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-700">
                                <span className="font-medium">Error:</span>{" "}
                                {activity.errorMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
