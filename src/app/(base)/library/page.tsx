"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Loader } from "@/components/atoms/loader";
import {
  ContentKitListItem,
  ContentKitListResponse,
  contentKitService,
} from "@/services/content-kit";
import {
  FileText,
  Video,
  Twitter,
  Download,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LayoutGrid,
  List,
  Search,
  Sparkles,
  RefreshCw,
  Package,
  Calendar,
  Film,
  Mic,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

const statusConfig = {
  PROCESSING: {
    label: "Processing",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
    icon: Clock,
  },
  COMPLETED: {
    label: "Ready",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: CheckCircle,
  },
  FAILED: {
    label: "Failed",
    color: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-500",
    icon: XCircle,
  },
};

const inputTypeConfig = {
  video: {
    label: "Video",
    icon: Video,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  prompt: {
    label: "AI Generated",
    icon: Sparkles,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  voice_note: {
    label: "Voice Note",
    icon: Mic,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  social_import: {
    label: "Social Media",
    icon: Twitter,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
};

const outputIcons = {
  hasTranscript: { icon: FileText, label: "Transcript" },
  hasBlogPost: { icon: FileText, label: "Blog Post" },
  hasLinkedInPost: { icon: Linkedin, label: "LinkedIn" },
  hasTweets: { icon: Twitter, label: "Tweets" },
  hasInstagramCarousel: { icon: Instagram, label: "Instagram" },
  hasFacebookPost: { icon: Facebook, label: "Facebook" },
  hasYouTubeScript: { icon: Youtube, label: "YouTube" },
  hasVideoClips: { icon: Film, label: "Video Clips" },
};

type ViewMode = "grid" | "list";
type FilterStatus = "all" | "COMPLETED" | "PROCESSING" | "FAILED";

function generateKitDisplayName(kit: ContentKitListItem): string {
  if (kit.kitName && kit.kitName !== `content-kit-${kit.jobId}`) {
    return kit.kitName;
  }

  const inputType =
    inputTypeConfig[kit.inputType as keyof typeof inputTypeConfig];
  const date = new Date(kit.createdAt);
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${inputType?.label || "Content"} Kit · ${month} ${day} at ${time}`;
}

export default function ContentKitsPage() {
  const router = useRouter();
  const [contentKits, setContentKits] = useState<ContentKitListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [deletingKit, setDeletingKit] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const loadContentKits = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const response: ContentKitListResponse =
        await contentKitService.listContentKits(
          20,
          loadMore ? nextToken : undefined
        );

      if (loadMore) {
        setContentKits((prev) => [...prev, ...response.contentKits]);
      } else {
        setContentKits(response.contentKits);
      }

      setNextToken(response.nextToken);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load content kits"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContentKits();
  }, []);

  const handleView = (jobId: string) => {
    router.push(`/library/${jobId}`);
  };

  const handleDownload = async (jobId: string) => {
    try {
      setActionError(null);
      const response = await contentKitService.downloadContentKit(jobId);
      const link = document.createElement("a");
      link.href = response.downloadUrl;
      link.download = `content-kit-${jobId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to download content kit"
      );
    }
  };

  const handleDelete = async (jobId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this content kit? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionError(null);
      setDeletingKit(jobId);
      await contentKitService.deleteContentKit(jobId);
      setContentKits((prev) => prev.filter((kit) => kit.jobId !== jobId));
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete content kit"
      );
    } finally {
      setDeletingKit(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredKits = contentKits
    .filter((kit) =>
      filterStatus === "all" ? true : kit.status === filterStatus
    )
    .filter((kit) => {
      if (!searchQuery) return true;
      const displayName = generateKitDisplayName(kit).toLowerCase();
      const query = searchQuery.toLowerCase();
      return (
        displayName.includes(query) ||
        kit.jobId.includes(query) ||
        kit.inputType.toLowerCase().includes(query)
      );
    });

  if (loading && contentKits.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Content Kits
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => loadContentKits()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-900 mb-3 tracking-tight">
            Content Kits
          </h1>
          <p className="text-base sm:text-lg text-stone-600">
            Your AI-generated content library, ready to download and publish
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search content kits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm text-zinc-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#3a8e9c]/20 focus:border-[#3a8e9c] transition-all"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="appearance-none pl-4 pr-10 py-2.5 border border-stone-200 rounded-xl text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3a8e9c]/20 focus:border-[#3a8e9c] transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Ready</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border border-stone-200 rounded-xl p-1 bg-white">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                viewMode === "grid"
                  ? "bg-[#3a8e9c] text-white shadow-sm"
                  : "text-stone-500 hover:bg-stone-50"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                viewMode === "list"
                  ? "bg-[#3a8e9c] text-white shadow-sm"
                  : "text-stone-500 hover:bg-stone-50"
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <Button
            onClick={() => loadContentKits()}
            variant="outline"
            size="sm"
            className="gap-2 border-stone-200 hover:bg-stone-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Action Error Display */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{actionError}</p>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredKits.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-stone-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || filterStatus !== "all"
                ? "No kits found"
                : "No content kits yet"}
            </h3>
            <p className="text-stone-600 mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first content kit by generating content from videos, voice notes, or AI prompts"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <Button
                asChild
                className="bg-[#3a8e9c] hover:bg-[#2d7a85] shadow-sm"
              >
                <a href="/generate">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </a>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Content Kits Grid/List */}
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                : "space-y-4"
            )}
          >
            {filteredKits.map((kit) => {
              const status = statusConfig[kit.status];
              const inputType =
                inputTypeConfig[kit.inputType as keyof typeof inputTypeConfig];
              const StatusIcon = status.icon;
              const InputIcon = inputType?.icon || Package;
              const displayName = generateKitDisplayName(kit);

              const activeOutputs = Object.entries(kit.outputs).filter(
                ([key, value]) => key !== "videoClipCount" && value === true
              );

              return (
                <Card
                  key={kit.jobId}
                  className={cn(
                    "group hover:shadow-lg hover:shadow-stone-200/50 hover:border-stone-300 transition-all duration-200",
                    viewMode === "list" && "flex items-center gap-6 p-5"
                  )}
                >
                  {viewMode === "grid" ? (
                    <>
                      {/* Grid View */}
                      <div className="p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                              inputType?.bgColor || "bg-stone-100"
                            )}
                          >
                            <InputIcon
                              className={cn(
                                "w-6 h-6",
                                inputType?.color || "text-stone-600"
                              )}
                            />
                          </div>
                          <Badge
                            className={cn(
                              "border px-2.5 py-1 font-medium",
                              status.color
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full mr-1.5",
                                status.dotColor
                              )}
                            />
                            {status.label}
                          </Badge>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="font-semibold text-zinc-900 text-lg mb-1.5 line-clamp-2 group-hover:text-[#3a8e9c] transition-colors">
                            {displayName}
                          </h3>
                          <p className="text-sm text-stone-500 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(kit.createdAt)}
                          </p>
                        </div>

                        {/* Error Message */}
                        {kit.errorMessage && (
                          <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                            <p className="text-sm text-red-700 line-clamp-2">
                              {kit.errorMessage}
                            </p>
                          </div>
                        )}

                        {/* Outputs Preview */}
                        {kit.status === "COMPLETED" && activeOutputs.length > 0 && (
                          <div className="pt-3 border-t border-stone-100">
                            <div className="flex flex-wrap gap-2">
                              {activeOutputs.slice(0, 4).map(([key]) => {
                                const output =
                                  outputIcons[
                                    key as keyof typeof outputIcons
                                  ];
                                if (!output) return null;
                                const OutputIcon = output.icon;
                                return (
                                  <div
                                    key={key}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 rounded-lg text-xs text-stone-700"
                                    title={output.label}
                                  >
                                    <OutputIcon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">
                                      {output.label}
                                    </span>
                                  </div>
                                );
                              })}
                              {activeOutputs.length > 4 && (
                                <div className="flex items-center px-2.5 py-1.5 bg-stone-50 rounded-lg text-xs text-stone-600">
                                  +{activeOutputs.length - 4} more
                                </div>
                              )}
                            </div>
                            {kit.outputs.videoClipCount > 0 && (
                              <p className="text-xs text-stone-600 mt-2">
                                {kit.outputs.videoClipCount} video clips
                              </p>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          {kit.status === "COMPLETED" && (
                            <>
                              <Button
                                onClick={() => handleView(kit.jobId)}
                                className="flex-1 bg-[#3a8e9c] hover:bg-[#2d7a85] shadow-sm"
                                size="sm"
                              >
                                <Eye className="h-4 w-4 mr-1.5" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(kit.jobId)}
                                className="border-stone-200 hover:bg-stone-50"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {kit.status === "PROCESSING" && (
                            <Button
                              disabled
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(kit.jobId)}
                            disabled={deletingKit === kit.jobId}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deletingKit === kit.jobId ? (
                              <Loader className="h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div
                        className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                          inputType?.bgColor || "bg-stone-100"
                        )}
                      >
                        <InputIcon
                          className={cn(
                            "w-7 h-7",
                            inputType?.color || "text-stone-600"
                          )}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-zinc-900 text-base truncate group-hover:text-[#3a8e9c] transition-colors">
                            {displayName}
                          </h3>
                          <Badge
                            className={cn(
                              "border px-2.5 py-1 font-medium flex-shrink-0",
                              status.color
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full mr-1.5",
                                status.dotColor
                              )}
                            />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-stone-500 flex items-center gap-1.5 mb-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(kit.createdAt)}
                          {kit.completedAt && (
                            <>
                              <span className="text-stone-300">•</span>
                              <span>Completed {formatDate(kit.completedAt)}</span>
                            </>
                          )}
                        </p>
                        {kit.status === "COMPLETED" && activeOutputs.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {activeOutputs.slice(0, 6).map(([key]) => {
                              const output =
                                outputIcons[key as keyof typeof outputIcons];
                              if (!output) return null;
                              const OutputIcon = output.icon;
                              return (
                                <div
                                  key={key}
                                  className="flex items-center gap-1 px-2 py-1 bg-stone-50 rounded-md text-xs text-stone-700"
                                  title={output.label}
                                >
                                  <OutputIcon className="w-3 h-3" />
                                  {output.label}
                                </div>
                              );
                            })}
                            {activeOutputs.length > 6 && (
                              <div className="px-2 py-1 bg-stone-50 rounded-md text-xs text-stone-600">
                                +{activeOutputs.length - 6}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {kit.status === "COMPLETED" && (
                          <>
                            <Button
                              onClick={() => handleView(kit.jobId)}
                              className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(kit.jobId)}
                              className="border-stone-200"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {kit.status === "PROCESSING" && (
                          <Button disabled variant="outline" size="sm">
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Processing
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(kit.jobId)}
                          disabled={deletingKit === kit.jobId}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingKit === kit.jobId ? (
                            <Loader className="h-4 w-4" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Load More */}
          {nextToken && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => loadContentKits(true)}
                disabled={loading}
                className="gap-2 border-stone-200 hover:bg-stone-50"
              >
                {loading ? <Loader className="h-4 w-4" /> : null}
                Load More Kits
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
