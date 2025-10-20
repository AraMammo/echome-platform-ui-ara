"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Loader } from "@/components/atoms/loader";
import { useToast } from "@/components/atoms/toast";
import { Progress } from "@/components/atoms/progress";
import { ContentKitStatus, contentKitService } from "@/services/content-kit";
import {
  FileText,
  Copy,
  Download,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Mail,
  Video,
  Check,
} from "lucide-react";

export default function LibraryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const jobId = params.jobId as string;

  const [contentKit, setContentKit] = useState<ContentKitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const loadContentKit = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      }
      setError(null);
      const data = await contentKitService.getContentKitStatus(jobId);
      setContentKit(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load content kit"
      );
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadContentKit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  useEffect(() => {
    if (contentKit?.status === "PROCESSING") {
      const interval = setInterval(() => {
        loadContentKit(true);
      }, 3000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKit?.status, jobId]);

  const formatContentForPlatform = (
    content: string | string[],
    platform: string
  ): string => {
    // Handle array content (tweets, carousel)
    if (Array.isArray(content)) {
      switch (platform) {
        case "tweets":
          return content
            .map((tweet, i) => `Tweet ${i + 1}:\n${tweet}`)
            .join("\n\n---\n\n");
        case "instagramCarousel":
          return content
            .map((slide, i) => `Slide ${i + 1}:\n${slide}`)
            .join("\n\n---\n\n");
        default:
          return content.join("\n\n");
      }
    }

    // For single string content, format based on platform
    switch (platform) {
      case "linkedInPost":
        // LinkedIn formatting - preserve line breaks and hashtags
        return content;
      case "instagramCaption":
        // Instagram formatting - preserve emojis and hashtags
        return content;
      case "facebookPost":
        // Facebook formatting
        return content;
      case "youtubeScript":
        // YouTube script with timestamps
        return content;
      case "newsletter":
        // Newsletter with proper formatting
        return content;
      default:
        return content;
    }
  };

  const copyToClipboard = async (
    content: string | string[],
    platform: string,
    label: string
  ) => {
    try {
      const formattedContent = formatContentForPlatform(content, platform);
      await navigator.clipboard.writeText(formattedContent);
      showToast(`${label} copied to clipboard!`, "success");
    } catch {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await contentKitService.downloadContentKit(jobId);
      const link = document.createElement("a");
      link.href = response.downloadUrl;
      link.download = `content-kit-${jobId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Content kit downloaded successfully!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to download content kit",
        "error"
      );
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error || !contentKit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Content Kit
          </h3>
          <p className="text-gray-600 mb-4">
            {error || "Content kit not found"}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/library")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
            <Button onClick={loadContentKit}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

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

  const status = statusConfig[contentKit.status];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/library")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium text-zinc-900">
              {contentKit.kitName || `Content Kit ${jobId.split("-").pop()}`}
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Created {formatDate(contentKit.createdAt)}
              {contentKit.completedAt && (
                <span> • Completed {formatDate(contentKit.completedAt)}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={status.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
          {contentKit.status === "COMPLETED" && (
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
            >
              {downloading ? (
                <Loader className="w-4 h-4 mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download All
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {contentKit.errorMessage && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-4">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-900 mb-1">Error</h3>
              <p className="text-sm text-red-700">{contentKit.errorMessage}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Processing Status */}
      {contentKit.status === "PROCESSING" && (
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Loader className="mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Generating Your Content Kit
                </h3>
                <p className="text-gray-600 text-sm">
                  Your content is being processed. This page will update
                  automatically.
                </p>
              </div>
            </div>

            {contentKit.progress && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {contentKit.progress.currentStep}
                    </span>
                    <span className="text-gray-500">
                      {Math.round(contentKit.progress.percentage)}%
                    </span>
                  </div>
                  <Progress value={contentKit.progress.percentage} />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {contentKit.progress.completedSteps.length} of{" "}
                      {contentKit.progress.totalSteps} steps completed
                    </span>
                    {contentKit.progress.estimatedTimeRemaining && (
                      <span>
                        ~
                        {Math.ceil(
                          contentKit.progress.estimatedTimeRemaining / 60
                        )}{" "}
                        min remaining
                      </span>
                    )}
                  </div>
                </div>

                {contentKit.progress.completedSteps.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Completed steps:
                    </p>
                    <div className="space-y-1">
                      {contentKit.progress.completedSteps.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs text-gray-600"
                        >
                          <Check className="h-3 w-3 text-green-600" />
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!contentKit.progress && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Initializing...</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Content Outputs */}
      {contentKit.status === "COMPLETED" && (
        <div className="space-y-6">
          {/* Transcript */}
          {contentKit.outputs.transcript && (
            <ContentCard
              title="Transcript"
              icon={FileText}
              content={contentKit.outputs.transcript}
              platform="transcript"
              onCopy={copyToClipboard}
            />
          )}

          {/* Blog Post */}
          {contentKit.outputs.blogPost && (
            <ContentCard
              title="Blog Post"
              icon={FileText}
              content={contentKit.outputs.blogPost}
              platform="blogPost"
              onCopy={copyToClipboard}
              imageUrl={contentKit.outputs.blogHeaderImage}
            />
          )}

          {/* LinkedIn Post */}
          {contentKit.outputs.linkedInPost && (
            <ContentCard
              title="LinkedIn Post"
              icon={Linkedin}
              content={contentKit.outputs.linkedInPost}
              platform="linkedInPost"
              onCopy={copyToClipboard}
            />
          )}

          {/* Tweet Thread */}
          {contentKit.outputs.tweets &&
            contentKit.outputs.tweets.length > 0 && (
              <ContentCard
                title={`Tweet Thread (${contentKit.outputs.tweets.length} tweets)`}
                icon={Twitter}
                content={contentKit.outputs.tweets}
                platform="tweets"
                onCopy={copyToClipboard}
              />
            )}

          {/* Instagram Carousel */}
          {contentKit.outputs.instagramCarousel &&
            contentKit.outputs.instagramCarousel.length > 0 && (
              <ContentCard
                title={`Instagram Carousel (${contentKit.outputs.instagramCarousel.length} slides)`}
                icon={Instagram}
                content={contentKit.outputs.instagramCarousel}
                platform="instagramCarousel"
                onCopy={copyToClipboard}
                images={contentKit.outputs.instagramCarouselImages}
              />
            )}

          {/* Facebook Post */}
          {contentKit.outputs.facebookPost && (
            <ContentCard
              title="Facebook Post"
              icon={Facebook}
              content={contentKit.outputs.facebookPost}
              platform="facebookPost"
              onCopy={copyToClipboard}
            />
          )}

          {/* YouTube Script */}
          {contentKit.outputs.youtubeScript && (
            <ContentCard
              title="YouTube Script"
              icon={Youtube}
              content={contentKit.outputs.youtubeScript}
              platform="youtubeScript"
              onCopy={copyToClipboard}
            />
          )}

          {/* Newsletter */}
          {contentKit.outputs.newsletter && (
            <ContentCard
              title="Newsletter"
              icon={Mail}
              content={contentKit.outputs.newsletter}
              platform="newsletter"
              onCopy={copyToClipboard}
            />
          )}

          {/* Video Clips */}
          {contentKit.outputs.videoClips &&
            contentKit.outputs.videoClips.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-stone-100 rounded-[10px] flex items-center justify-center">
                    <Video className="w-5 h-5 text-[#3a8e9c]" />
                  </div>
                  <h3 className="text-lg font-medium text-zinc-900">
                    Video Clips ({contentKit.outputs.videoClips.length})
                  </h3>
                </div>
                <div className="space-y-4">
                  {contentKit.outputs.videoClips.map((clip, index) => (
                    <div
                      key={index}
                      className="p-4 bg-stone-50 rounded-[12px] border border-stone-200"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-zinc-900 mb-2">
                            Clip {index + 1}
                          </h4>
                          <p className="text-sm text-stone-600 mb-2">
                            {clip.metadata.text}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-stone-500">
                            <span>
                              Duration: {clip.metadata.duration.toFixed(1)}s
                            </span>
                            <span>
                              Score: {clip.metadata.engagementScore.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <a
                          href={clip.vertical}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-sm bg-white border border-stone-300 rounded-[8px] hover:bg-stone-50 text-center"
                        >
                          Vertical
                        </a>
                        <a
                          href={clip.horizontal}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-sm bg-white border border-stone-300 rounded-[8px] hover:bg-stone-50 text-center"
                        >
                          Horizontal
                        </a>
                        <a
                          href={clip.square}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-sm bg-white border border-stone-300 rounded-[8px] hover:bg-stone-50 text-center"
                        >
                          Square
                        </a>
                        <a
                          href={clip.original}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-sm bg-white border border-stone-300 rounded-[8px] hover:bg-stone-50 text-center"
                        >
                          Original
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
        </div>
      )}
    </div>
  );
}

interface ContentCardProps {
  title: string;
  icon: React.ElementType;
  content: string | string[];
  platform: string;
  onCopy: (content: string | string[], platform: string, label: string) => void;
  imageUrl?: string;
  images?: string[];
}

function ContentCard({
  title,
  icon: Icon,
  content,
  platform,
  onCopy,
  imageUrl,
  images,
}: ContentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const renderContent = () => {
    if (Array.isArray(content)) {
      return (
        <div className="space-y-4">
          {content.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-[10px] border border-stone-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {platform === "tweets"
                    ? `Tweet ${index + 1}`
                    : `Slide ${index + 1}`}
                </Badge>
                {images && images[index] && (
                  <a
                    href={images[index]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#3a8e9c] hover:underline"
                  >
                    View Image
                  </a>
                )}
              </div>
              <p className="text-sm text-zinc-900 whitespace-pre-wrap">
                {item}
              </p>
            </div>
          ))}
        </div>
      );
    }

    const preview = content.substring(0, 300);
    const needsExpansion = content.length > 300;

    return (
      <div className="space-y-3">
        {imageUrl && (
          <div className="rounded-[12px] overflow-hidden border border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={title} className="w-full h-auto" />
          </div>
        )}
        <p className="text-sm text-zinc-900 whitespace-pre-wrap">
          {expanded || !needsExpansion ? content : `${preview}...`}
        </p>
        {needsExpansion && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-[#3a8e9c] hover:underline"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-100 rounded-[10px] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#3a8e9c]" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900">{title}</h3>
        </div>
        <Button
          onClick={() => onCopy(content, platform, title)}
          size="sm"
          className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </Button>
      </div>
      <div className="bg-stone-50 rounded-[12px] p-4">{renderContent()}</div>
    </Card>
  );
}
