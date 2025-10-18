"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Label } from "@/components/atoms/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/atoms/tabs";
import {
  Youtube,
  Loader2,
  CheckCircle,
  Upload,
  Search,
  Grid3X3,
  List,
  Video,
  Music,
  File,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  HardDrive,
  FileText,
  Zap,
  Brain,
  Clock,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { youtubeConnectionService } from "@/services/youtubeConnectionService";
import {
  fileUploadService,
  s3UploadService,
  transcriptionService,
  transcriptionStatusService,
  startPdfProcessingJobService,
  pdfStatusService,
  mediaService,
  MediaFile,
} from "@/services";
import {
  knowledgeBaseService,
  UploadContentRequest,
} from "@/services/knowledge-base";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/atoms/toast";

export default function KnowledgeBaseRedesign() {
  const { showToast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  // Gmail Tutorial state
  const [isTutorialExpanded, setIsTutorialExpanded] = useState(false);

  // Tab 3: Paste Content state
  const [pasteFormData, setPasteFormData] = useState<{
    title: string;
    content: string;
    contentType: UploadContentRequest["contentType"];
  }>({
    title: "",
    content: "",
    contentType: "other",
  });
  const [isPasteUploading, setIsPasteUploading] = useState(false);

  // Media management state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("All Types");

  // Media files state
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Progress and stats state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [uploadSuccessData, setUploadSuccessData] = useState<{
    filename: string;
    wordsLearned: number;
    itemsAdded: number;
  } | null>(null);
  const [totalWords, setTotalWords] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Recommendation engine state
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>(
    []
  );
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneData, setMilestoneData] = useState<{
    count: number;
    message: string;
  } | null>(null);
  const [contentTypeBreakdown, setContentTypeBreakdown] = useState({
    emails: 0,
    documents: 0,
    videos: 0,
    articles: 0,
  });

  // Upload pipeline state (Tab 1)
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStep, setUploadStep] = useState<
    | "idle"
    | "getting-url"
    | "uploading-to-s3"
    | "starting-transcription"
    | "starting-pdf-processing"
    | "completed"
  >("idle");
  const [uploadData, setUploadData] = useState<{
    fileId: string;
    key: string;
    uploadUrl: string;
    jobId?: string;
  } | null>(null);
  const [transcriptionStatus, setTranscriptionStatus] = useState<string>("");
  const [isMonitoringTranscription, setIsMonitoringTranscription] =
    useState(false);
  const [isWaitingCompleteTranscripting, setIsWaitingCompleteTranscripting] =
    useState(false);
  const [isPdfFile, setIsPdfFile] = useState(false);

  const ALLOWED_TYPES = {
    pdf: ["application/pdf"],
    audio: [
      "audio/mpeg",
      "audio/wav",
      "audio/mp4",
      "audio/aac",
      "audio/ogg",
      "audio/flac",
      "audio/webm",
    ],
    video: [
      "video/mp4",
      "video/quicktime",
      "video/avi",
      "video/webm",
      "video/mpeg",
      "video/x-msvideo",
      "video/x-ms-wmv",
      "video/x-flv",
      "video/3gpp",
      "video/x-matroska",
    ],
  };

  const getMaxFileSize = (fileType: string): number => {
    if (ALLOWED_TYPES.audio.includes(fileType)) return 100 * 1024 * 1024;
    if (ALLOWED_TYPES.video.includes(fileType)) return 500 * 1024 * 1024;
    if (ALLOWED_TYPES.pdf.includes(fileType)) return 50 * 1024 * 1024;
    return 0;
  };

  const MAX_AUDIO_DURATION = 10 * 60;
  const MAX_VIDEO_DURATION = 20 * 60;

  // Helper functions for stats and progress
  const calculateProgress = () => {
    const totalFiles = mediaFiles.length;
    return Math.min((totalFiles / 200) * 100, 100);
  };

  const getMotivationalMessage = (progress: number) => {
    if (progress <= 25) return "Just getting started! Keep adding content.";
    if (progress <= 50) return "Making progress! Your AI is learning fast.";
    if (progress <= 75) return "Almost there! Echo Me knows your style well.";
    return "Fully trained! Your content will be exceptional.";
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getRelativeTime = (date: Date | null): string => {
    if (!date) return "Never";
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const showError = (message: string) => {
    setError(message);
    showToast(message, "error");
    setTimeout(() => setError(null), 5000);
  };

  // Recommendation engine helpers
  const analyzeContentTypes = (files: MediaFile[]) => {
    const breakdown = {
      emails: 0,
      documents: 0,
      videos: 0,
      articles: 0,
    };

    files.forEach((file) => {
      const fileName = file.fileName.toLowerCase();
      const contentType = file.contentType.toLowerCase();

      if (fileName.includes("email") || fileName.includes(".mbox")) {
        breakdown.emails++;
      } else if (
        contentType === "application/pdf" ||
        fileName.includes(".pdf")
      ) {
        breakdown.documents++;
      } else if (
        contentType.startsWith("video/") ||
        contentType.startsWith("audio/")
      ) {
        breakdown.videos++;
      } else {
        breakdown.articles++;
      }
    });

    setContentTypeBreakdown(breakdown);
    return breakdown;
  };

  const getContentDiversity = () => {
    const total = mediaFiles.length;
    if (total === 0) return { emails: 0, documents: 0, videos: 0, articles: 0 };

    return {
      emails: Math.round((contentTypeBreakdown.emails / total) * 100),
      documents: Math.round((contentTypeBreakdown.documents / total) * 100),
      videos: Math.round((contentTypeBreakdown.videos / total) * 100),
      articles: Math.round((contentTypeBreakdown.articles / total) * 100),
    };
  };

  const getMissingContentTypes = () => {
    const missing: string[] = [];
    if (contentTypeBreakdown.emails === 0) missing.push("emails");
    if (contentTypeBreakdown.documents === 0) missing.push("documents");
    if (contentTypeBreakdown.videos === 0) missing.push("videos/audio");
    if (contentTypeBreakdown.articles === 0) missing.push("articles");
    return missing;
  };

  const isSuggestionDismissed = (suggestionId: string) => {
    return dismissedSuggestions.includes(suggestionId);
  };

  const dismissSuggestion = (suggestionId: string) => {
    const updated = [...dismissedSuggestions, suggestionId];
    setDismissedSuggestions(updated);
    localStorage.setItem("dismissedSuggestions", JSON.stringify(updated));
  };

  const checkMilestone = (fileCount: number) => {
    const milestones = [
      {
        count: 25,
        message:
          "You've added 25 pieces of content.\nEcho Me is starting to understand your style.",
      },
      {
        count: 50,
        message:
          "50 files uploaded.\nYour content quality is improving significantly.",
      },
      {
        count: 100,
        message:
          "100 pieces of content.\nEcho Me now has a strong grasp of your voice.",
      },
      {
        count: 200,
        message:
          "Your AI brain is complete.\nYou're ready to create exceptional content.",
      },
    ];

    const lastMilestone = localStorage.getItem("lastMilestone");
    const lastCount = lastMilestone ? parseInt(lastMilestone) : 0;

    for (const milestone of milestones) {
      if (fileCount >= milestone.count && lastCount < milestone.count) {
        setMilestoneData(milestone);
        setShowMilestoneModal(true);
        localStorage.setItem("lastMilestone", milestone.count.toString());
        setTimeout(() => setShowMilestoneModal(false), 5000);
        return;
      }
    }
  };

  const getNextStepGuidance = () => {
    const progress = calculateProgress();
    const filesNeeded = 200 - mediaFiles.length;

    if (progress <= 25) {
      return {
        title: "Next Step",
        message: "Upload 5-10 more of your best-performing content pieces",
      };
    } else if (progress <= 50) {
      return {
        title: "Next Step",
        message: "Import your Gmail sent folder for 10x training",
      };
    } else if (progress <= 75) {
      return {
        title: "Next Step",
        message: "Connect YouTube or add video transcripts",
      };
    } else if (progress < 100) {
      return {
        title: "Almost There!",
        message: `Add final ${filesNeeded} files to hit 200 and unlock full potential`,
      };
    } else {
      return {
        title: "You're Ready!",
        message: "Start generating amazing content",
        link: "/generate",
      };
    }
  };

  const validateFile = async (file: File): Promise<boolean> => {
    const allAllowed = [
      ...ALLOWED_TYPES.pdf,
      ...ALLOWED_TYPES.audio,
      ...ALLOWED_TYPES.video,
    ];
    if (!allAllowed.includes(file.type)) {
      showError(
        "Invalid file type. Only PDF, audio, and video files are allowed."
      );
      return false;
    }
    const maxSize = getMaxFileSize(file.type);
    if (file.size > maxSize) {
      showError(
        `File size too large. Maximum allowed size is ${formatFileSize(maxSize)}.`
      );
      return false;
    }
    if (
      ALLOWED_TYPES.audio.includes(file.type) ||
      ALLOWED_TYPES.video.includes(file.type)
    ) {
      try {
        const duration = await getFileDuration(file);
        const maxDuration = ALLOWED_TYPES.audio.includes(file.type)
          ? MAX_AUDIO_DURATION
          : MAX_VIDEO_DURATION;
        if (duration > maxDuration) {
          const maxMinutes = Math.floor(maxDuration / 60);
          const kind = ALLOWED_TYPES.audio.includes(file.type)
            ? "audio"
            : "video";
          showError(
            `${kind[0].toUpperCase()}${kind.slice(1)} files must be under ${maxMinutes} minutes.`
          );
          return false;
        }
      } catch {
        showError("Unable to validate file duration. Please try again.");
        return false;
      }
    }
    return true;
  };

  const getFileDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const video = document.createElement("video");

      const handleLoad = () => {
        const duration = audio.duration || video.duration;
        if (duration && isFinite(duration)) resolve(duration);
        else reject(new Error("Invalid duration"));
      };
      const handleError = () => reject(new Error("Failed to load file"));

      if (ALLOWED_TYPES.audio.includes(file.type)) {
        audio.addEventListener("loadedmetadata", handleLoad);
        audio.addEventListener("error", handleError);
        audio.src = URL.createObjectURL(file);
      } else if (ALLOWED_TYPES.video.includes(file.type)) {
        video.addEventListener("loadedmetadata", handleLoad);
        video.addEventListener("error", handleError);
        video.src = URL.createObjectURL(file);
      } else {
        resolve(0);
      }
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/"))
      return <Video className="w-6 h-6 text-[#3a8e9c]" />;
    if (file.type.startsWith("audio/"))
      return <Music className="w-6 h-6 text-[#3a8e9c]" />;
    return <File className="w-6 h-6 text-[#3a8e9c]" />;
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchMediaFiles();
    }

    // Load dismissed suggestions from localStorage
    const saved = localStorage.getItem("dismissedSuggestions");
    if (saved) {
      try {
        setDismissedSuggestions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse dismissed suggestions", e);
      }
    }
  }, [isAuthenticated, authLoading]);

  const fetchMediaFiles = async () => {
    try {
      setMediaLoading(true);
      setMediaError(null);

      const response = await mediaService.getFiles();
      const files = response.data || [];
      setMediaFiles(files);

      // Analyze content types
      analyzeContentTypes(files);

      // Check for milestones
      checkMilestone(files.length);

      // Calculate total words (estimate: 150 words per minute of audio/video, 500 words per PDF page)
      let estimatedWords = 0;
      files.forEach((file) => {
        if (
          file.contentType.startsWith("video/") ||
          file.contentType.startsWith("audio/")
        ) {
          // Assume average 5 minute duration per file, 150 words per minute
          estimatedWords += 750;
        } else if (file.contentType === "application/pdf") {
          // Assume average 10 pages, 500 words per page
          estimatedWords += 5000;
        } else {
          // Text files, assume 500 words
          estimatedWords += 500;
        }
      });
      setTotalWords(estimatedWords);

      // Update last updated time
      if (files.length > 0) {
        const mostRecent = files.reduce((latest, file) => {
          const fileDate = new Date(file.uploadedAt);
          return fileDate > latest ? fileDate : latest;
        }, new Date(0));
        setLastUpdated(mostRecent);
      }
    } catch (error) {
      console.error("Error fetching media files:", error);
      setMediaError("Failed to load media files. Please try again.");
    } finally {
      setMediaLoading(false);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;
    const file = files[0];
    const isValid = await validateFile(file);
    if (isValid) {
      setUploadedFiles([file]);
      setError(null);
    } else if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;
    setUploading(true);
    setUploadStep("getting-url");
    setError(null);
  };

  React.useEffect(() => {
    const processUpload = async () => {
      if (!uploading || uploadedFiles.length === 0) return;
      try {
        const file = uploadedFiles[0];

        if (uploadStep === "getting-url") {
          const up = await fileUploadService.getUploadUrl(file.name, file.type);
          setUploadData({
            fileId: up.fileId,
            key: up.key,
            uploadUrl: up.uploadUrl,
          });
          setUploadStep("uploading-to-s3");
        }

        if (uploadStep === "uploading-to-s3" && uploadData) {
          await s3UploadService.uploadToS3(uploadData.uploadUrl, file);
          if (ALLOWED_TYPES.pdf.includes(file.type))
            setUploadStep("starting-pdf-processing");
          else setUploadStep("starting-transcription");
        }

        if (uploadStep === "starting-transcription" && uploadData) {
          if (transcriptionService.isTranscriptionSupported(file.type)) {
            await new Promise((r) => setTimeout(r, 3000));
            const res = await transcriptionService.startTranscription(
              uploadData.fileId
            );
            setUploadData((prev) =>
              prev ? { ...prev, jobId: res.jobId } : null
            );
            setIsMonitoringTranscription(true);
            setIsWaitingCompleteTranscripting(true);
            setTranscriptionStatus("PENDING");
          }
          setUploadStep("completed");
          setUploading(false);
          await fetchMediaFiles();
        }

        if (uploadStep === "starting-pdf-processing" && uploadData) {
          await new Promise((r) => setTimeout(r, 3000));
          const res = await startPdfProcessingJobService.startPdfProcessingJob(
            uploadData.fileId
          );
          setUploadData((prev) =>
            prev ? { ...prev, jobId: res.jobId } : null
          );
          setIsMonitoringTranscription(true);
          setIsWaitingCompleteTranscripting(true);
          setIsPdfFile(true);
          setTranscriptionStatus("PENDING");
          setUploadStep("completed");
          setUploading(false);
          await fetchMediaFiles();
        }
      } catch (error: unknown) {
        setUploading(false);
        setUploadStep("idle");
        showError("Upload failed. Please try again.");
        console.error("Upload error:", error);
      }
    };
    processUpload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploading, uploadStep, uploadedFiles, uploadData]);

  React.useEffect(() => {
    const monitorStatus = async () => {
      if (!isMonitoringTranscription || !uploadData?.jobId) return;
      try {
        if (isPdfFile) {
          const statusData = await pdfStatusService.getPdfStatus(
            uploadData.jobId
          );
          setTranscriptionStatus(statusData.status);
          if (
            pdfStatusService.isPdfCompleted(statusData.status) &&
            statusData.extractedText
          ) {
            setIsMonitoringTranscription(false);
            setIsWaitingCompleteTranscripting(false);
            setIsPdfFile(false);
            showToast("PDF processing completed successfully!", "success");

            // Show success animation
            const filename = uploadedFiles[0]?.name || "File";
            const wordsLearned = statusData.wordCount || 5000;
            setUploadSuccessData({
              filename,
              wordsLearned,
              itemsAdded: 1,
            });
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 8000);

            await fetchMediaFiles();
            setUploadedFiles([]);
          } else if (
            pdfStatusService.isPdfFailed(statusData.status) &&
            !statusData.extractedText
          ) {
            setIsMonitoringTranscription(false);
            setIsWaitingCompleteTranscripting(false);
            setIsPdfFile(false);
            showError(
              `PDF processing failed: ${statusData.errorMessage || "Unknown error"}`
            );
          }
        } else {
          const statusData =
            await transcriptionStatusService.getTranscriptionStatus(
              uploadData.jobId
            );
          setTranscriptionStatus(statusData.status);
          if (
            transcriptionStatusService.isTranscriptionCompleted(
              statusData.status
            ) &&
            statusData.transcript &&
            statusData.confidence
          ) {
            setIsMonitoringTranscription(false);
            setIsWaitingCompleteTranscripting(false);
            showToast("Transcription completed successfully!", "success");

            // Show success animation
            const filename = uploadedFiles[0]?.name || "File";
            const transcript = statusData.transcript || "";
            const wordsLearned = transcript.split(/\s+/).length;
            setUploadSuccessData({
              filename,
              wordsLearned,
              itemsAdded: 1,
            });
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 8000);

            await fetchMediaFiles();
            setUploadedFiles([]);
          } else if (
            transcriptionStatusService.isTranscriptionFailed(statusData.status)
          ) {
            setIsMonitoringTranscription(false);
            setIsWaitingCompleteTranscripting(false);
            showError("Transcription failed. Please try again.");
          }
        }
      } catch (error: unknown) {
        console.error("Status check failed:", error);
      }
    };
    if (isMonitoringTranscription) {
      monitorStatus();
      const interval = setInterval(monitorStatus, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMonitoringTranscription, uploadData?.jobId, isPdfFile]);

  const handlePasteContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pasteFormData.content.trim()) {
      showToast("Content is required", "error");
      return;
    }

    setIsPasteUploading(true);

    try {
      const payload: UploadContentRequest = {
        content: pasteFormData.content,
        title: pasteFormData.title || "Untitled",
        contentType: pasteFormData.contentType,
      };

      const response = await knowledgeBaseService.uploadContent(payload);

      showToast(
        `Content uploaded successfully! ${response.vectorCount} vector(s) created.`,
        "success"
      );

      // Show success animation
      const wordsLearned = pasteFormData.content.split(/\s+/).length;
      setUploadSuccessData({
        filename: pasteFormData.title || "Pasted Content",
        wordsLearned,
        itemsAdded: 1,
      });
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 8000);

      // Reset form
      setPasteFormData({
        title: "",
        content: "",
        contentType: "other",
      });

      // Refresh media files
      await fetchMediaFiles();
    } catch (error) {
      console.error("Upload error:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to upload content",
        "error"
      );
    } finally {
      setIsPasteUploading(false);
    }
  };

  const handleConnectYouTube = async () => {
    try {
      const response = await youtubeConnectionService.youtubeConnection({});
      window.location.href = response.authUrl;
    } catch (error) {
      console.error("YouTube connection error:", error);
      showToast("Failed to connect to YouTube", "error");
    }
  };

  const isYouTubeConnected = () => {
    const connectionData = localStorage.getItem("youtube_connection_data");
    if (connectionData) {
      try {
        const data = JSON.parse(connectionData);
        return !!data.connectionId;
      } catch {
        return false;
      }
    }
    return false;
  };

  const filteredMediaFiles = mediaFiles.filter((file) => {
    const matchesSearch = file.fileName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      mediaTypeFilter === "All Types" ||
      (mediaTypeFilter === "Videos" && file.contentType.startsWith("video/")) ||
      (mediaTypeFilter === "Audio" && file.contentType.startsWith("audio/")) ||
      (mediaTypeFilter === "Documents" &&
        file.contentType === "application/pdf");

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-[#1c1c1e] font-['Satoshi'] mb-4">
            Your Content DNA
          </h1>
          <p className="text-xl text-stone-700 font-['Satoshi'] leading-relaxed max-w-3xl mx-auto mb-8">
            Echo Me learns from YOUR voice, YOUR style, YOUR expertise. The more
            you feed it, the better your content becomes.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] px-6 py-3 rounded-[10px]"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Content
            </Button>
            <Button
              variant="outline"
              className="border-[#3a8e9c] text-[#3a8e9c] hover:bg-[#3a8e9c]/10 font-medium font-['Satoshi'] px-6 py-3 rounded-[10px]"
            >
              <Zap className="w-5 h-5 mr-2" />
              Connect Sources
            </Button>
          </div>
        </div>

        {/* Milestone Modal */}
        {showMilestoneModal && milestoneData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
            <div className="bg-white rounded-[10px] p-8 max-w-md mx-4 shadow-xl animate-scale-in">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-[#3a8e9c] to-[#9b8baf] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-medium text-[#1c1c1e] font-['Satoshi'] mb-3">
                  {milestoneData.count === 25 && "🎯 Milestone!"}
                  {milestoneData.count === 50 && "🚀 Halfway There!"}
                  {milestoneData.count === 100 && "💪 Century!"}
                  {milestoneData.count === 200 && "🏆 Fully Trained!"}
                </h3>
                <p className="text-stone-700 font-['Satoshi'] whitespace-pre-line">
                  {milestoneData.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Smart Suggestions Banner - Scenario A: No content */}
        {!mediaLoading &&
          mediaFiles.length === 0 &&
          !isSuggestionDismissed("no-content") && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[10px] p-6 mb-8 border border-blue-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚀</span>
                    <h3 className="text-lg font-medium text-[#1c1c1e] font-['Satoshi']">
                      Quick Start: Upload Your Best Work
                    </h3>
                  </div>
                  <p className="text-sm text-stone-700 font-['Satoshi'] mb-4">
                    Start with 3-5 of your best-performing emails or articles.
                    This gives Echo Me a foundation to learn from.
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] px-4 py-2 rounded-[10px] text-sm"
                  >
                    Upload Files
                  </Button>
                </div>
                <button
                  onClick={() => dismissSuggestion("no-content")}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

        {/* Smart Suggestions Banner - Scenario B: No Gmail */}
        {!mediaLoading &&
          mediaFiles.length > 0 &&
          mediaFiles.length <= 50 &&
          contentTypeBreakdown.emails === 0 &&
          !isSuggestionDismissed("no-gmail") && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-[10px] p-6 mb-8 border border-purple-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💡</span>
                    <h3 className="text-lg font-medium text-[#1c1c1e] font-['Satoshi']">
                      10x Your Training: Import Your Gmail Sent Folder
                    </h3>
                  </div>
                  <p className="text-sm text-stone-700 font-['Satoshi'] mb-2">
                    You&apos;ve uploaded {mediaFiles.length} files. Add your
                    Gmail sent folder to give Echo Me hundreds of examples of
                    your writing style.
                  </p>
                  <p className="text-xs text-purple-600 font-medium font-['Satoshi'] mb-4">
                    This typically adds 200-500 examples instantly
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setIsTutorialExpanded(true);
                        window.scrollTo({
                          top:
                            document.getElementById("gmail-tutorial")
                              ?.offsetTop || 0,
                          behavior: "smooth",
                        });
                      }}
                      className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] px-4 py-2 rounded-[10px] text-sm"
                    >
                      Show Me How
                    </Button>
                    <Button
                      onClick={() => dismissSuggestion("no-gmail")}
                      variant="outline"
                      className="border-stone-300 text-stone-700 font-medium font-['Satoshi'] px-4 py-2 rounded-[10px] text-sm"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => dismissSuggestion("no-gmail")}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

        {/* Smart Suggestions Banner - Scenario C: No YouTube */}
        {!mediaLoading &&
          mediaFiles.length > 0 &&
          mediaFiles.length <= 50 &&
          contentTypeBreakdown.videos === 0 &&
          !isYouTubeConnected() &&
          !isSuggestionDismissed("no-youtube") && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-[10px] p-6 mb-8 border border-red-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎥</span>
                    <h3 className="text-lg font-medium text-[#1c1c1e] font-['Satoshi']">
                      Add Your Video Content
                    </h3>
                  </div>
                  <p className="text-sm text-stone-700 font-['Satoshi'] mb-4">
                    Connect your YouTube channel to automatically import video
                    transcripts. Great for learning your speaking style.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleConnectYouTube}
                      className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] px-4 py-2 rounded-[10px] text-sm"
                    >
                      Connect YouTube
                    </Button>
                    <Button
                      onClick={() => dismissSuggestion("no-youtube")}
                      variant="outline"
                      className="border-stone-300 text-stone-700 font-medium font-['Satoshi'] px-4 py-2 rounded-[10px] text-sm"
                    >
                      Not Now
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => dismissSuggestion("no-youtube")}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

        {/* AI Brain Progress Indicator */}
        {!mediaLoading && mediaFiles.length > 0 && (
          <div className="bg-gradient-to-r from-[#3a8e9c]/10 to-[#9b8baf]/10 rounded-[10px] p-6 mb-8 border border-[#3a8e9c]/20">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-[#3a8e9c]" />
              <h3 className="text-xl font-medium text-[#1c1c1e] font-['Satoshi']">
                Your AI Brain: {Math.round(calculateProgress())}% Trained
              </h3>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-stone-200 rounded-full overflow-hidden mb-3">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#3a8e9c] to-[#9b8baf] rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-stone-700 font-['Satoshi']">
                <span className="font-medium text-[#1c1c1e]">
                  {mediaFiles.length} files
                </span>{" "}
                • {formatNumber(totalWords)} words
              </div>
              <div className="text-stone-600 font-['Satoshi']">
                Goal: 200+ files for best results
              </div>
            </div>

            <p className="text-sm text-[#3a8e9c] font-medium font-['Satoshi'] mt-3">
              {getMotivationalMessage(calculateProgress())}
            </p>
          </div>
        )}

        {/* Stats Dashboard */}
        {!mediaLoading && mediaFiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Total Items Card */}
            <div className="bg-white rounded-[10px] p-6 border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-[#3a8e9c]/10 rounded-[10px] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#3a8e9c]" />
                </div>
                {mediaLoading ? (
                  <div className="h-8 w-16 bg-stone-200 rounded animate-pulse" />
                ) : (
                  <div className="text-3xl font-medium text-[#1c1c1e] font-['Satoshi']">
                    {mediaFiles.length}
                  </div>
                )}
              </div>
              <p className="text-sm text-stone-600 font-['Satoshi']">
                Content Pieces
              </p>
            </div>

            {/* Total Words Card */}
            <div className="bg-white rounded-[10px] p-6 border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-[#9b8baf]/10 rounded-[10px] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#9b8baf]" />
                </div>
                {mediaLoading ? (
                  <div className="h-8 w-16 bg-stone-200 rounded animate-pulse" />
                ) : (
                  <div className="text-3xl font-medium text-[#1c1c1e] font-['Satoshi']">
                    {formatNumber(totalWords)}
                  </div>
                )}
              </div>
              <p className="text-sm text-stone-600 font-['Satoshi']">
                Words Analyzed
              </p>
            </div>

            {/* Last Updated Card */}
            <div className="bg-white rounded-[10px] p-6 border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-[10px] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                {mediaLoading ? (
                  <div className="h-8 w-16 bg-stone-200 rounded animate-pulse" />
                ) : (
                  <div className="text-3xl font-medium text-[#1c1c1e] font-['Satoshi']">
                    {getRelativeTime(lastUpdated).split(" ")[0]}
                  </div>
                )}
              </div>
              <p className="text-sm text-stone-600 font-['Satoshi']">
                {lastUpdated ? "Last Sync" : "Never synced"}
              </p>
            </div>
          </div>
        )}

        {/* Upload Success Animation */}
        {showSuccessAnimation && uploadSuccessData && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-[10px] p-6 mb-8 border border-green-200 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 animate-scale-in">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-green-900 font-['Satoshi'] mb-2 flex items-center gap-2">
                  Great! Echo Me is getting smarter{" "}
                  <Sparkles className="w-5 h-5 text-green-600" />
                </h3>
                <p className="text-sm text-green-800 font-['Satoshi'] mb-3">
                  ✅ {uploadSuccessData.filename} processed
                </p>
                <div className="space-y-1 text-sm text-green-700 font-['Satoshi']">
                  <p>→ Added {uploadSuccessData.itemsAdded} examples</p>
                  <p>
                    → Learned {formatNumber(uploadSuccessData.wordsLearned)} new
                    words
                  </p>
                  <p>
                    → Your writing style is now{" "}
                    {Math.round(calculateProgress())}% trained
                  </p>
                </div>
                <p className="text-sm text-green-600 font-medium font-['Satoshi'] mt-3">
                  Keep going! Add more to improve quality.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Diversity Meter */}
        {!mediaLoading && mediaFiles.length > 0 && (
          <div className="bg-white rounded-[10px] p-6 mb-8 border border-stone-200">
            <h3 className="text-lg font-medium text-[#1c1c1e] font-['Satoshi'] mb-4">
              Content Diversity
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-stone-700 font-['Satoshi']">
                    Emails
                  </span>
                  <span className="text-sm font-medium text-[#1c1c1e] font-['Satoshi']">
                    {getContentDiversity().emails}%
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${getContentDiversity().emails}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-stone-700 font-['Satoshi']">
                    Documents
                  </span>
                  <span className="text-sm font-medium text-[#1c1c1e] font-['Satoshi']">
                    {getContentDiversity().documents}%
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${getContentDiversity().documents}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-stone-700 font-['Satoshi']">
                    Videos/Audio
                  </span>
                  <span className="text-sm font-medium text-[#1c1c1e] font-['Satoshi']">
                    {getContentDiversity().videos}%
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${getContentDiversity().videos}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-stone-700 font-['Satoshi']">
                    Articles
                  </span>
                  <span className="text-sm font-medium text-[#1c1c1e] font-['Satoshi']">
                    {getContentDiversity().articles}%
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${getContentDiversity().articles}%` }}
                  />
                </div>
              </div>
            </div>
            {getMissingContentTypes().length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-[10px] border border-amber-200">
                <p className="text-sm text-amber-800 font-['Satoshi']">
                  💡 Tip: Add {getMissingContentTypes().join(", ")} to give Echo
                  Me a more complete picture of your expertise
                </p>
              </div>
            )}
          </div>
        )}

        {/* Gmail Takeout Tutorial */}
        <div
          id="gmail-tutorial"
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[10px] p-6 mb-8 border border-blue-200"
        >
          <button
            onClick={() => setIsTutorialExpanded(!isTutorialExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-[#3a8e9c]" />
              <div>
                <h3 className="text-lg font-medium text-[#1c1c1e] font-['Satoshi']">
                  Pro Tip: Export Your Gmail Sent Folder
                </h3>
                <p className="text-sm text-stone-600 font-['Satoshi']">
                  Get hundreds of writing examples in minutes
                </p>
              </div>
            </div>
            {isTutorialExpanded ? (
              <ChevronUp className="w-5 h-5 text-[#3a8e9c]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#3a8e9c]" />
            )}
          </button>

          {isTutorialExpanded && (
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-base font-medium text-[#1c1c1e] font-['Satoshi'] mb-3">
                  How to Export Your Gmail Sent Folder
                </h4>
                <ol className="space-y-2 text-sm text-stone-700 font-['Satoshi'] list-decimal list-inside">
                  <li>
                    Go to{" "}
                    <a
                      href="https://takeout.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3a8e9c] underline"
                    >
                      Google Takeout
                    </a>
                  </li>
                  <li>Click &quot;Deselect All&quot;</li>
                  <li>Scroll to &quot;Mail&quot; and check it</li>
                  <li>Click &quot;All Mail data included&quot;</li>
                  <li>Uncheck everything EXCEPT &quot;Sent&quot;</li>
                  <li>
                    Click &quot;Next step&quot; → &quot;Create export&quot;
                  </li>
                  <li>Download when ready (usually a few minutes)</li>
                  <li>Upload the .mbox file here</li>
                </ol>
              </div>
              <div className="bg-white/80 rounded-[10px] p-4 border border-blue-200">
                <h5 className="text-sm font-medium text-[#1c1c1e] font-['Satoshi'] mb-2">
                  What Echo Me learns:
                </h5>
                <ul className="space-y-1 text-sm text-stone-700 font-['Satoshi']">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#3a8e9c]" />
                    Your writing tone and style
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#3a8e9c]" />
                    How you explain complex topics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#3a8e9c]" />
                    Your sentence structure and vocabulary
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#3a8e9c]" />
                    Topics you frequently discuss
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Three Upload Paths - Tabs */}
        <div className="bg-white rounded-[10px] p-8 border border-stone-200 mb-12">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-stone-100 rounded-[10px] p-1 mb-8">
              <TabsTrigger
                value="upload"
                className="rounded-[10px] font-medium font-['Satoshi'] data-[state=active]:bg-white data-[state=active]:text-[#1c1c1e]"
              >
                Upload Files
              </TabsTrigger>
              <TabsTrigger
                value="connect"
                className="rounded-[10px] font-medium font-['Satoshi'] data-[state=active]:bg-white data-[state=active]:text-[#1c1c1e]"
              >
                Connect Accounts
              </TabsTrigger>
              <TabsTrigger
                value="paste"
                className="rounded-[10px] font-medium font-['Satoshi'] data-[state=active]:bg-white data-[state=active]:text-[#1c1c1e]"
              >
                Paste Content
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Upload Files */}
            <TabsContent value="upload" className="space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-[#1c1c1e] font-['Satoshi'] mb-2">
                  Upload Your Best Work
                </h2>
              </div>

              <div className="bg-stone-50 rounded-[10px] p-6 border border-stone-200">
                <h3 className="text-base font-medium text-[#1c1c1e] font-['Satoshi'] mb-3">
                  What should you upload?
                </h3>
                <ul className="space-y-2 text-sm text-stone-700 font-['Satoshi']">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3a8e9c] flex-shrink-0 mt-0.5" />
                    Past emails that got great responses
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3a8e9c] flex-shrink-0 mt-0.5" />
                    Blog posts that performed well
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3a8e9c] flex-shrink-0 mt-0.5" />
                    Video transcripts from your best content
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3a8e9c] flex-shrink-0 mt-0.5" />
                    PDFs of articles you&apos;ve written
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#3a8e9c] flex-shrink-0 mt-0.5" />
                    Scripts that converted
                  </li>
                </ul>
              </div>

              {/* Drag and Drop Zone */}
              <div
                className={`bg-white rounded-[10px] p-8 border-2 border-dashed transition-colors ${
                  dragActive
                    ? "border-[#3a8e9c] bg-[#3a8e9c]/5"
                    : "border-stone-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <Upload
                    size={48}
                    className={`mx-auto mb-4 ${dragActive ? "text-[#3a8e9c]" : "text-stone-400"}`}
                  />
                  <h3 className="text-xl font-medium text-[#1c1c1e] font-['Satoshi'] mb-2">
                    Drop your files here
                  </h3>
                  <p className="text-stone-600 font-['Satoshi'] mb-4">
                    Or click to browse and select files
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-stone-500 mb-6">
                    <div className="flex items-center gap-1">
                      <File className="w-4 h-4" />
                      <span>PDF</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Music className="w-4 h-4" />
                      <span>MP3, WAV</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      <span>MP4, MOV</span>
                    </div>
                  </div>
                  <Button
                    className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] px-6 py-3 rounded-[10px]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm,.mp4,.mov,.avi,.mpeg,.mpg,.wmv,.flv,.3gp,.mkv"
                    onChange={handleChange}
                    className="hidden"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-6">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="p-4 bg-stone-50 rounded-[10px] border border-stone-200 flex justify-between items-center gap-4"
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(file)}
                          <div>
                            <div className="text-[#1c1c1e] text-sm font-medium">
                              {file.name}
                            </div>
                            <div className="text-stone-500 text-xs">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-stone-200 rounded-full"
                        >
                          <X className="w-4 h-4 text-stone-500" />
                        </button>
                      </div>
                    ))}

                    <Button
                      onClick={handleUpload}
                      disabled={uploading || isWaitingCompleteTranscripting}
                      className={`w-full mt-4 rounded-[10px] font-medium font-['Satoshi'] ${uploading || isWaitingCompleteTranscripting ? "bg-stone-300 cursor-not-allowed" : "bg-[#3a8e9c] hover:bg-[#2d7a85] text-white"}`}
                    >
                      {uploading || isWaitingCompleteTranscripting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {uploadStep === "getting-url" &&
                            "Getting Upload URL..."}
                          {uploadStep === "uploading-to-s3" && "Uploading..."}
                          {uploadStep === "starting-transcription" &&
                            !isWaitingCompleteTranscripting &&
                            "Starting Transcription..."}
                          {uploadStep === "starting-pdf-processing" &&
                            "Processing PDF..."}
                          {uploadStep === "completed" &&
                            isWaitingCompleteTranscripting &&
                            (isPdfFile
                              ? `PDF Processing: ${transcriptionStatus}`
                              : `Transcription: ${transcriptionStatus}`)}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Start Processing
                        </span>
                      )}
                    </Button>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-[10px]">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab 2: Connect Accounts */}
            <TabsContent value="connect" className="space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-[#1c1c1e] font-['Satoshi'] mb-2">
                  Auto-Import Your Content
                </h2>
                <p className="text-stone-600 font-['Satoshi']">
                  Connect once, stay synced forever
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* YouTube Connection Card */}
                <div className="bg-white rounded-[10px] p-6 border border-stone-200 hover:border-[#3a8e9c] transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-[10px] flex items-center justify-center">
                      <Youtube className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-[#1c1c1e] font-['Satoshi']">
                      YouTube
                    </h3>
                  </div>
                  <p className="text-sm text-stone-600 font-['Satoshi'] mb-4">
                    Import video transcripts automatically
                  </p>
                  {isYouTubeConnected() ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium font-['Satoshi']">
                        Connected
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={handleConnectYouTube}
                      className="w-full bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] rounded-[10px]"
                    >
                      Connect
                    </Button>
                  )}
                </div>

                {/* Gmail Connection Card */}
                <div className="bg-white rounded-[10px] p-6 border border-stone-200 hover:border-[#3a8e9c] transition-colors opacity-60">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-[10px] flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-[#1c1c1e] font-['Satoshi']">
                      Gmail
                    </h3>
                  </div>
                  <p className="text-sm text-stone-600 font-['Satoshi'] mb-4">
                    Pull from your sent folder
                  </p>
                  <div className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium font-['Satoshi'] inline-block">
                    Coming Soon
                  </div>
                </div>

                {/* Google Drive Connection Card */}
                <div className="bg-white rounded-[10px] p-6 border border-stone-200 hover:border-[#3a8e9c] transition-colors opacity-60">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-[10px] flex items-center justify-center">
                      <HardDrive className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-medium text-[#1c1c1e] font-['Satoshi']">
                      Google Drive
                    </h3>
                  </div>
                  <p className="text-sm text-stone-600 font-['Satoshi'] mb-4">
                    Sync documents and files
                  </p>
                  <div className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium font-['Satoshi'] inline-block">
                    Coming Soon
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Paste Content */}
            <TabsContent value="paste" className="space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-[#1c1c1e] font-['Satoshi'] mb-2">
                  Have Something to Add Right Now?
                </h2>
              </div>

              <div className="bg-stone-50 rounded-[10px] p-6 border border-stone-200">
                <h3 className="text-base font-medium text-[#1c1c1e] font-['Satoshi'] mb-3">
                  Paste any text content:
                </h3>
                <ul className="space-y-1 text-sm text-stone-700 font-['Satoshi']">
                  <li>• Email you just sent</li>
                  <li>• Article you wrote</li>
                  <li>• Social post that performed well</li>
                  <li>• Notes from a talk you gave</li>
                </ul>
              </div>

              <form onSubmit={handlePasteContentSubmit} className="space-y-6">
                <div>
                  <Label
                    htmlFor="paste-title"
                    className="text-sm font-medium text-[#1c1c1e] font-['Satoshi'] mb-2 block"
                  >
                    Title (Optional)
                  </Label>
                  <Input
                    id="paste-title"
                    placeholder="e.g., My Best Email"
                    value={pasteFormData.title}
                    onChange={(e) =>
                      setPasteFormData({
                        ...pasteFormData,
                        title: e.target.value,
                      })
                    }
                    disabled={isPasteUploading}
                    className="border-stone-300 rounded-[10px] font-['Satoshi']"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="paste-category"
                    className="text-sm font-medium text-[#1c1c1e] font-['Satoshi'] mb-2 block"
                  >
                    Category (Optional)
                  </Label>
                  <Select
                    value={pasteFormData.contentType}
                    onValueChange={(value) =>
                      setPasteFormData({
                        ...pasteFormData,
                        contentType:
                          value as UploadContentRequest["contentType"],
                      })
                    }
                    disabled={isPasteUploading}
                  >
                    <SelectTrigger
                      id="paste-category"
                      className="border-stone-300 rounded-[10px] font-['Satoshi']"
                    >
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="blog_post">Blog Post</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="linkedin_post">
                        LinkedIn Post
                      </SelectItem>
                      <SelectItem value="tweet">Tweet/X Post</SelectItem>
                      <SelectItem value="instagram_caption">
                        Instagram Caption
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="paste-content"
                    className="text-sm font-medium text-[#1c1c1e] font-['Satoshi'] mb-2 block"
                  >
                    Content <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="paste-content"
                    placeholder="Paste your content here..."
                    rows={8}
                    value={pasteFormData.content}
                    onChange={(e) =>
                      setPasteFormData({
                        ...pasteFormData,
                        content: e.target.value,
                      })
                    }
                    disabled={isPasteUploading}
                    required
                    className="border-stone-300 rounded-[10px] font-['Satoshi'] resize-none"
                  />
                  <p className="text-xs text-stone-500 font-['Satoshi'] mt-2">
                    {pasteFormData.content.length} characters
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isPasteUploading || !pasteFormData.content.trim()}
                  className="w-full bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] px-6 py-3 rounded-[10px]"
                >
                  {isPasteUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Save to Knowledge Base
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Content Library */}
        <div className="bg-white rounded-[10px] p-8 border border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-medium text-[#1c1c1e] font-['Satoshi']">
              Your Content Library
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="border-stone-300 text-[#1c1c1e] rounded-[10px]"
              >
                {viewMode === "grid" ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid3X3 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 border-stone-300 text-[#1c1c1e] font-['Satoshi'] rounded-[10px]"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={mediaTypeFilter}
                onValueChange={setMediaTypeFilter}
              >
                <SelectTrigger className="w-[180px] border-stone-300 text-[#1c1c1e] font-['Satoshi'] rounded-[10px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Types">All Types</SelectItem>
                  <SelectItem value="Videos">Videos</SelectItem>
                  <SelectItem value="Audio">Audio</SelectItem>
                  <SelectItem value="Documents">Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {mediaLoading ? (
            <div className="space-y-4">
              {/* Skeleton Loaders */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-stone-50 rounded-[10px] border border-stone-200"
                >
                  <div className="w-10 h-10 bg-stone-200 rounded-[10px] animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-stone-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : mediaError ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={40} className="text-red-600" />
              </div>
              <p className="text-red-600 font-['Satoshi'] text-lg mb-2">
                {mediaError}
              </p>
            </div>
          ) : mediaFiles.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-[#3a8e9c]/10 to-[#9b8baf]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain size={48} className="text-[#3a8e9c]" />
              </div>
              <h3 className="text-2xl font-medium text-[#1c1c1e] font-['Satoshi'] mb-3">
                Your AI Brain is Empty
              </h3>
              <p className="text-stone-600 font-['Satoshi'] max-w-md mx-auto mb-6">
                Upload your first file to start training Echo Me on your unique
                voice and expertise.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    fileInputRef.current?.click();
                  }}
                  className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] px-6 py-3 rounded-[10px]"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Your First File
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                  className="border-stone-300 text-stone-700 hover:bg-stone-50 font-medium font-['Satoshi'] px-6 py-3 rounded-[10px]"
                >
                  See what to upload
                </Button>
              </div>
            </div>
          ) : filteredMediaFiles.length > 0 ? (
            <div
              className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              {filteredMediaFiles.map((file) => (
                <div
                  key={file.id}
                  className={`p-4 bg-stone-50 rounded-[10px] border border-stone-200 hover:border-[#3a8e9c] transition-colors ${viewMode === "list" ? "flex items-center gap-4" : ""}`}
                >
                  <div className="w-10 h-10 bg-[#3a8e9c]/10 rounded-[10px] flex items-center justify-center flex-shrink-0">
                    {file.contentType?.startsWith("video/") ? (
                      <Video className="w-5 h-5 text-[#3a8e9c]" />
                    ) : file.contentType?.startsWith("audio/") ? (
                      <Music className="w-5 h-5 text-[#3a8e9c]" />
                    ) : (
                      <File className="w-5 h-5 text-[#3a8e9c]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[#1c1c1e] font-['Satoshi'] truncate">
                      {file.fileName}
                    </h4>
                    <p className="text-xs text-stone-500 font-['Satoshi']">
                      {file.contentType} •{" "}
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                    {file.status === "COMPLETED" && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle size={12} className="text-green-500" />
                        <span className="text-xs text-green-600 font-['Satoshi']">
                          Processed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={40} className="text-[#3a8e9c]" />
              </div>
              <p className="text-stone-500 font-['Satoshi'] text-lg mb-2">
                No content uploaded yet.
              </p>
              <p className="text-sm text-stone-400 font-['Satoshi']">
                Upload files, connect accounts, or paste content to start
                building your knowledge base.
              </p>
            </div>
          )}
        </div>

        {/* What's Next Section */}
        {!mediaLoading && mediaFiles.length > 0 && (
          <div className="bg-gradient-to-r from-[#3a8e9c]/5 to-[#9b8baf]/5 rounded-[10px] p-6 mt-8 border border-[#3a8e9c]/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#3a8e9c] rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-[#1c1c1e] font-['Satoshi'] mb-2">
                  {getNextStepGuidance().title}
                </h3>
                <p className="text-stone-700 font-['Satoshi'] mb-4">
                  {getNextStepGuidance().message}
                </p>
                {getNextStepGuidance().link && (
                  <Button
                    onClick={() =>
                      (window.location.href = getNextStepGuidance().link!)
                    }
                    className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] px-6 py-3 rounded-[10px]"
                  >
                    Start Generating Content →
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
