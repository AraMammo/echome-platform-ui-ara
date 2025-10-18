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
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

const statusConfig = {
  PROCESSING: {
    label: "Processing",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  FAILED: {
    label: "Failed",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const inputTypeConfig = {
  video: {
    label: "Video Upload",
    icon: Video,
    color: "bg-stone-100 text-stone-800",
  },
  prompt: {
    label: "Text Prompt",
    icon: FileText,
    color: "bg-stone-100 text-stone-800",
  },
  voice_note: {
    label: "Voice Note",
    icon: FileText,
    color: "bg-stone-100 text-stone-800",
  },
  social_import: {
    label: "Social Import",
    icon: Twitter,
    color: "bg-stone-100 text-stone-800",
  },
};

type ViewMode = "grid" | "list";
type FilterStatus = "all" | "COMPLETED" | "PROCESSING" | "FAILED";

export default function LibraryPage() {
  const router = useRouter();
  const [contentKits, setContentKits] = useState<ContentKitListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [deletingKit, setDeletingKit] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
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

  const filteredKits =
    filterStatus === "all"
      ? contentKits
      : contentKits.filter((kit) => kit.status === filterStatus);

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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Library
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => loadContentKits()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-zinc-900 mb-2">
            Content Library
          </h1>
          <p className="text-sm sm:text-base text-stone-600">
            Manage and download your generated content kits
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2 px-3 py-2 border border-stone-200 rounded-[10px]">
            <Filter className="w-4 h-4 text-stone-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="text-sm text-zinc-900 bg-transparent outline-none"
            >
              <option value="all">All</option>
              <option value="COMPLETED">Completed</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border border-stone-200 rounded-[10px] p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-[8px] transition-colors",
                viewMode === "grid"
                  ? "bg-[#3a8e9c] text-white"
                  : "text-stone-600 hover:bg-stone-100"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-[8px] transition-colors",
                viewMode === "list"
                  ? "bg-[#3a8e9c] text-white"
                  : "text-stone-600 hover:bg-stone-100"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={() => loadContentKits()} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Action Error Display */}
      {actionError && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{actionError}</p>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredKits.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Content Kits Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first content kit by uploading content or entering a
            prompt.
          </p>
          <Button asChild className="bg-[#3a8e9c] hover:bg-[#2d7a85]">
            <a href="/generate">Generate Content</a>
          </Button>
        </Card>
      ) : (
        <>
          {/* Content Kits */}
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            )}
          >
            {filteredKits.map((kit) => {
              const status = statusConfig[kit.status];
              const inputType =
                inputTypeConfig[kit.inputType as keyof typeof inputTypeConfig];
              const StatusIcon = status.icon;
              const InputIcon = inputType.icon;

              return (
                <Card
                  key={kit.jobId}
                  className={cn(
                    "p-5 hover:shadow-md transition-shadow",
                    viewMode === "list" && "flex items-center gap-4"
                  )}
                >
                  <div className="flex-1">
                    {/* Status and Type Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                      <Badge className={inputType.color}>
                        <InputIcon className="h-3 w-3 mr-1" />
                        {inputType.label}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="font-medium text-zinc-900 mb-2">
                      {kit.kitName ||
                        `Content Kit ${kit.jobId.split("-").pop()}`}
                    </h3>

                    {/* Date Info */}
                    <p className="text-sm text-stone-600 mb-3">
                      Created {formatDate(kit.createdAt)}
                      {kit.completedAt && (
                        <span> • Completed {formatDate(kit.completedAt)}</span>
                      )}
                    </p>

                    {/* Error Message */}
                    {kit.errorMessage && (
                      <p className="text-sm text-red-600 mb-3">
                        Error: {kit.errorMessage}
                      </p>
                    )}

                    {/* Outputs Summary */}
                    {kit.status === "COMPLETED" && (
                      <div className="text-sm text-stone-600">
                        {Object.values(kit.outputs).filter(Boolean).length}{" "}
                        outputs
                        {kit.outputs.videoClipCount > 0 &&
                          `, ${kit.outputs.videoClipCount} video clips`}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    {kit.status === "COMPLETED" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(kit.jobId)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(kit.jobId)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </>
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
                </Card>
              );
            })}
          </div>

          {/* Load More */}
          {nextToken && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => loadContentKits(true)}
                disabled={loading}
              >
                {loading ? <Loader className="h-4 w-4 mr-2" /> : null}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
