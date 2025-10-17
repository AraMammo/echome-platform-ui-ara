"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Loader } from "@/components/atoms/loader";
import { ContentKitStatus, contentKitService } from "@/services/content-kit";
import {
  FileText,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Mail,
  ArrowLeft,
  Copy,
  Check,
  Download,
  Trash2,
  AlertCircle,
} from "lucide-react";

const statusConfig = {
  PROCESSING: { label: "Processing", color: "bg-yellow-100 text-yellow-800" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-800" },
};

interface ContentSection {
  key: keyof ContentKitStatus["outputs"];
  label: string;
  icon: typeof FileText;
  description: string;
}

const contentSections: ContentSection[] = [
  {
    key: "transcript",
    label: "Transcript",
    icon: FileText,
    description: "Full transcription of your video or audio",
  },
  {
    key: "blogPost",
    label: "Blog Post",
    icon: FileText,
    description: "SEO-optimized blog article",
  },
  {
    key: "linkedInPost",
    label: "LinkedIn Post",
    icon: Linkedin,
    description: "Professional LinkedIn content",
  },
  {
    key: "tweets",
    label: "Tweet Thread",
    icon: Twitter,
    description: "Engaging Twitter/X thread",
  },
  {
    key: "instagramCarousel",
    label: "Instagram Carousel",
    icon: Instagram,
    description: "Instagram carousel captions",
  },
  {
    key: "facebookPost",
    label: "Facebook Post",
    icon: Facebook,
    description: "Engaging Facebook content",
  },
  {
    key: "youtubeScript",
    label: "YouTube Script",
    icon: Youtube,
    description: "Video script for YouTube",
  },
  {
    key: "newsletter",
    label: "Newsletter",
    icon: Mail,
    description: "Email newsletter content",
  },
];

export default function ContentKitDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [contentKit, setContentKit] = useState<ContentKitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadContentKit();
  }, [resolvedParams.jobId]);

  const loadContentKit = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentKitService.getContentKitStatus(
        resolvedParams.jobId
      );
      setContentKit(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load content kit"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (fieldLabel: string, content: string | string[]) => {
    const textToCopy = Array.isArray(content) ? content.join("\n\n") : content;
    await navigator.clipboard.writeText(textToCopy);
    setCopiedField(fieldLabel);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownload = async () => {
    try {
      const response = await contentKitService.downloadContentKit(
        resolvedParams.jobId
      );
      const link = document.createElement("a");
      link.href = response.downloadUrl;
      link.download = `content-kit-${resolvedParams.jobId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download content kit");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this content kit? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await contentKitService.deleteContentKit(resolvedParams.jobId);
      router.push("/content-kits");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete content kit");
      setDeleting(false);
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
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={loadContentKit}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  const status = statusConfig[contentKit.status];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {contentKit.kitName ||
                  `Content Kit ${resolvedParams.jobId.split("-").pop()}`}
              </h1>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Created {formatDate(contentKit.createdAt)}
              {contentKit.completedAt && (
                <span> • Completed {formatDate(contentKit.completedAt)}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {contentKit.status === "COMPLETED" && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download ZIP
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader className="h-4 w-4 mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {contentKit.errorMessage && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Generation Failed</p>
              <p className="text-sm text-red-700">{contentKit.errorMessage}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Content Sections */}
      {contentKit.status === "COMPLETED" && (
        <div className="space-y-4">
          {contentSections.map((section) => {
            const content = contentKit.outputs[section.key];
            if (!content) return null;

            const Icon = section.icon;
            const isArray = Array.isArray(content);

            return (
              <Card key={section.key} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#3a8e9c]/10 rounded-lg">
                      <Icon className="h-5 w-5 text-[#3a8e9c]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {section.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const contentToCopy =
                        typeof content === "string"
                          ? content
                          : JSON.stringify(content, null, 2);
                      handleCopy(section.label, contentToCopy);
                    }}
                  >
                    {copiedField === section.label ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                {isArray ? (
                  <div className="space-y-4">
                    {(content as string[]).map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="text-xs text-gray-500 mb-2">
                          {section.key === "tweets"
                            ? `Tweet ${index + 1}/${(content as string[]).length}`
                            : `Slide ${index + 1}/${(content as string[]).length}`}
                        </div>
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {content as string}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Processing State */}
      {contentKit.status === "PROCESSING" && (
        <Card className="p-8 text-center">
          <Loader className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Generating Your Content Kit
          </h3>
          <p className="text-gray-600">
            This may take a few minutes. You can leave this page and come back
            later.
          </p>
          <Button variant="outline" onClick={loadContentKit} className="mt-4">
            Refresh Status
          </Button>
        </Card>
      )}
    </div>
  );
}
