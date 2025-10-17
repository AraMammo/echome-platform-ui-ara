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
  Image,
  Video,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Download,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

const outputIcons = {
  hasTranscript: FileText,
  hasBlogPost: FileText,
  hasLinkedInPost: Linkedin,
  hasTweets: Twitter,
  hasInstagramCarousel: Instagram,
  hasFacebookPost: Facebook,
  hasYouTubeScript: Youtube,
  hasVideoClips: Video,
};

export default function ContentKitsPage() {
  const router = useRouter();
  const [contentKits, setContentKits] = useState<ContentKitListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [deletingKit, setDeletingKit] = useState<string | null>(null);

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
    router.push(`/content-kits/${jobId}`);
  };

  const handleDownload = async (jobId: string) => {
    try {
      const response = await contentKitService.downloadContentKit(jobId);
      const link = document.createElement("a");
      link.href = response.downloadUrl;
      link.download = `content-kit-${jobId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download content kit");
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
      setDeletingKit(jobId);
      await contentKitService.deleteContentKit(jobId);
      // Remove from local state
      setContentKits((prev) => prev.filter((kit) => kit.jobId !== jobId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete content kit");
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

  const getOutputCount = (outputs: ContentKitListItem["outputs"]) => {
    const counts = [
      outputs.hasTranscript,
      outputs.hasBlogPost,
      outputs.hasLinkedInPost,
      outputs.hasTweets,
      outputs.hasInstagramCarousel,
      outputs.hasFacebookPost,
      outputs.hasYouTubeScript,
      outputs.hasVideoClips,
    ].filter(Boolean).length;

    const videoCount = outputs.videoClipCount;
    return { counts, videoCount };
  };

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
            Error Loading Content Kits
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => loadContentKits()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Kits</h1>
          <p className="text-gray-600">
            Manage and download your generated content kits
          </p>
        </div>
        <Button onClick={() => loadContentKits()}>Refresh</Button>
      </div>

      {contentKits.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Content Kits Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first content kit by uploading a video or entering a
            prompt.
          </p>
          <Button asChild className="bg-[#3a8e9c] hover:bg-[#2d7a85]">
            <a href="/create">Create Content Kit</a>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contentKits.map((kit) => {
            const status = statusConfig[kit.status];
            const inputType =
              inputTypeConfig[kit.inputType as keyof typeof inputTypeConfig];
            const StatusIcon = status.icon;
            const InputIcon = inputType.icon;
            const { counts, videoCount } = getOutputCount(kit.outputs);

            return (
              <Card key={kit.jobId} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                      <Badge className={inputType.color}>
                        <InputIcon className="h-3 w-3 mr-1" />
                        {inputType.label}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Content Kit {kit.jobId.split("-").pop()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Created {formatDate(kit.createdAt)}
                        {kit.completedAt && (
                          <span>
                            {" "}
                            • Completed {formatDate(kit.completedAt)}
                          </span>
                        )}
                      </p>
                      {kit.errorMessage && (
                        <p className="text-sm text-red-600 mt-1">
                          Error: {kit.errorMessage}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Outputs:</span>
                        <div className="flex items-center gap-1">
                          {Object.entries(outputIcons).map(([key, Icon]) => {
                            const hasOutput =
                              kit.outputs[key as keyof typeof kit.outputs];
                            if (!hasOutput) return null;

                            return (
                              <div key={key} className="flex items-center">
                                <Icon className="h-4 w-4 text-gray-500" />
                                {key === "hasVideoClips" && videoCount > 0 && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    {videoCount}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-sm text-gray-500">
                          ({counts} outputs
                          {videoCount > 0 && `, ${videoCount} video clips`})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
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
                </div>
              </Card>
            );
          })}
        </div>
      )}

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
    </div>
  );
}
