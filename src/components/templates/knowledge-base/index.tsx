"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/atoms/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Input } from "@/components/atoms/input";
import {
  Youtube,
  Zap,
  Loader2,
  CheckCircle,
  Upload,
  Search,
  Grid3X3,
  List,
  Eye,
  Video,
  Plus,
  Settings,
  File,
  Music,
  AlertCircle,
  X,
} from "lucide-react";
import { youtubeConnectionService } from "@/services/youtubeConnectionService";
import {
  fileUploadService,
  s3UploadService,
  transcriptionService,
  transcriptionStatusService,
  startPdfProcessingJobService,
  pdfStatusService,
  FileUploadServiceError,
  S3UploadServiceError,
  TranscriptionServiceError,
  TranscriptionStatusServiceError,
  StartPdfProcessingJobError,
  PdfStatusServiceError,
  mediaService,
  MediaServiceError,
  MediaFile,
} from "@/services";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/atoms/toast";
import MediaSettings from "./setting";
import ManualContentUpload from "@/components/molecules/manual-content-upload";
import SocialImportSection from "@/components/molecules/social-import-section";
import ImportJobTracker from "@/components/molecules/import-job-tracker";

export default function KnowledgeBaseTemplate() {
  const { success, error: showToastError } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [isSyncingVideos, setIsSyncingVideos] = useState(false);

  const hasInitialized = useRef(false);

  // Media management state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("All Types");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Media files state
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // YouTube videos state
  const [userVideos, setUserVideos] = useState<
    Array<{
      videoId: string;
      title: string;
      description?: string;
      publishedAt?: string;
      viewCount?: string | number;
    }>
  >([]);
  const [isLoadingUserVideos, setIsLoadingUserVideos] = useState(false);

  // Social import jobs state
  const [importJobs, setImportJobs] = useState<string[]>([]);

  // Upload pipeline state
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
  const [transcriptionData, setTranscriptionData] = useState<{
    status: string;
    transcript?: string;
    confidence?: number;
    startTime?: string;
    completionTime?: string;
    extractedText?: string;
    textLength?: number;
    wordCount?: number;
    errorMessage?: string;
  } | null>(null);
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

  const showError = (message: string) => {
    setError(message);
    showToastError(message);
    setTimeout(() => setError(null), 5000);
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
      return <Video className="w-6 h-6 text-blue-500" />;
    if (file.type.startsWith("audio/"))
      return <Music className="w-6 h-6 text-green-500" />;
    return <File className="w-6 h-6 text-red-500" />;
  };

  const processAuthorizationCode = React.useCallback(
    async (code: string, state: string) => {
      try {
        // Step 1: Connect to YouTube
        const result = await youtubeConnectionService.youtubeConnectCallback({
          code,
          state,
        });

        localStorage.setItem("youtube_connection_data", JSON.stringify(result));

        // Step 2: Sync videos automatically
        setIsSyncingVideos(true);
        try {
          await youtubeConnectionService.syncVideo({
            connectionId: result.connectionId,
            maxResults: 20,
          });
        } catch (syncError) {
          const errorMessage =
            syncError instanceof Error ? syncError.message : "Unknown error";
          showToastError(
            `Video sync failed, but connection successful: ${errorMessage}`
          );
        } finally {
          setIsSyncingVideos(false);
        }

        // Step 3: Fetch user videos
        await fetchUserVideos();

        success("YouTube connected and synced successfully!");
        localStorage.removeItem("youtube_oauth_code");
        localStorage.removeItem("youtube_oauth_state");
      } catch (err) {
        console.error("Error processing authorization code:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Connection failed";

        showToastError(`YouTube connection failed: ${errorMessage}`);

        localStorage.removeItem("youtube_oauth_code");
        localStorage.removeItem("youtube_oauth_state");
      }
    },
    [success, showToastError]
  );

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    const oauthCode = localStorage.getItem("youtube_oauth_code");
    const oauthState = localStorage.getItem("youtube_oauth_state");

    if (oauthCode && oauthState) {
      processAuthorizationCode(oauthCode, oauthState);
    } else {
      const connectionData = localStorage.getItem("youtube_connection_data");
      if (connectionData) {
        try {
          JSON.parse(connectionData);
          fetchUserVideos();
        } catch (error) {
          console.error("Error parsing connection data:", error);
          localStorage.removeItem("youtube_connection_data");
        }
      }
    }

    if (!authLoading && isAuthenticated) {
      fetchMediaFiles();
    }

    if (isYouTubeConnected()) {
      fetchUserVideos();
    }
  }, [isAuthenticated, authLoading, processAuthorizationCode, success]);

  // Function to handle viewing a file
  const handleViewFile = async (file: MediaFile) => {
    try {
      if (file.contentType.startsWith("video/")) {
        alert(
          `Video file: ${file.fileName}\nSize: ${(file.size / 1024 / 1024).toFixed(1)} MB\nStatus: ${file.status}`
        );
      } else if (file.contentType.startsWith("audio/")) {
        alert(
          `Audio file: ${file.fileName}\nSize: ${(file.size / 1024 / 1024).toFixed(1)} MB\nStatus: ${file.status}`
        );
      } else if (file.contentType === "application/pdf") {
        alert(
          `PDF file: ${file.fileName}\nSize: ${(file.size / 1024 / 1024).toFixed(1)} MB\nStatus: ${file.status}`
        );
      } else {
        alert(
          `File: ${file.fileName}\nType: ${file.contentType}\nSize: ${(file.size / 1024 / 1024).toFixed(1)} MB\nStatus: ${file.status}`
        );
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      setError("Failed to view file. Please try again.");
    }
  };

  // Function to fetch media files
  const fetchMediaFiles = async () => {
    try {
      setMediaLoading(true);
      setMediaError(null);

      const response = await mediaService.getFiles();

      // Handle both old format (files) and new format (data)
      const files = response.data || [];
      setMediaFiles(files);
    } catch (error) {
      console.error("Error fetching media files:", error);
      if (error instanceof MediaServiceError) {
        if (
          error.message.includes("expired") ||
          error.message.includes("No access token")
        ) {
          setMediaError("Authentication expired. Please sign in again.");
          setTimeout(() => {
            window.location.href = "/signin";
          }, 2000);
        } else {
          setMediaError(`Failed to load media files: ${error.message}`);
        }
      } else if (error instanceof Error) {
        if (
          error.message.includes("expired") ||
          error.message.includes("No access token")
        ) {
          setMediaError("Authentication expired. Please sign in again.");
          setTimeout(() => {
            window.location.href = "/signin";
          }, 2000);
        } else {
          setMediaError(`Failed to load media files: ${error.message}`);
        }
      } else {
        setMediaError("Failed to load media files. Please try again.");
      }
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
    setTranscriptionData(null);
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
        if (error instanceof FileUploadServiceError)
          showError(`Upload URL failed: ${error.message}`);
        else if (error instanceof S3UploadServiceError)
          showError(`S3 upload failed: ${error.message}`);
        else if (error instanceof TranscriptionServiceError)
          showError(`Transcription failed: ${error.message}`);
        else if (error instanceof StartPdfProcessingJobError)
          showError(`PDF processing failed: ${error.message}`);
        else showError("Upload failed. Please try again.");
        console.error("Upload error:", error);
      }
    };
    processUpload();
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
          setTranscriptionData({
            status: statusData.status,
            extractedText: statusData.extractedText,
            textLength: statusData.textLength,
            wordCount: statusData.wordCount,
            errorMessage: statusData.errorMessage,
          });
          if (
            pdfStatusService.isPdfCompleted(statusData.status) &&
            statusData.extractedText
          ) {
            setIsMonitoringTranscription(false);
            setIsWaitingCompleteTranscripting(false);
            setIsPdfFile(false);
            success("PDF processing completed successfully!");
            await fetchMediaFiles();
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
          setTranscriptionData(statusData);
          if (
            transcriptionStatusService.isTranscriptionCompleted(
              statusData.status
            ) &&
            statusData.transcript &&
            statusData.confidence
          ) {
            setIsMonitoringTranscription(false);
            setIsWaitingCompleteTranscripting(false);
            success("Transcription completed successfully!");
            await fetchMediaFiles();
          } else if (
            transcriptionStatusService.isTranscriptionFailed(statusData.status)
          ) {
            setIsMonitoringTranscription(false);
            setIsWaitingCompleteTranscripting(false);
            showError("Transcription failed. Please try again.");
          }
        }
      } catch (error: unknown) {
        if (
          error instanceof TranscriptionStatusServiceError ||
          error instanceof PdfStatusServiceError
        ) {
          console.error("Status check failed:", error.message);
        } else {
          console.error("Unexpected error checking status:", error);
        }
      }
    };
    if (isMonitoringTranscription) {
      monitorStatus();
      const interval = setInterval(monitorStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isMonitoringTranscription, uploadData?.jobId, isPdfFile]);

  const fetchUserVideos = async () => {
    try {
      setIsLoadingUserVideos(true);
      const result = await youtubeConnectionService.youtubeUserVideos();

      setUserVideos(result.videos ?? []);
      setIsLoadingUserVideos(false);
    } catch (error: unknown) {
      console.error("User Videos API Error:", error);
      setUserVideos([]);
    } finally {
      setIsLoadingUserVideos(false);
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

  const handleImportSuccess = (jobId: string) => {
    setImportJobs((prev) => [...prev, jobId]);
    success("Content import started! We'll notify you when it's complete.");
  };

  const handleJobComplete = (status: {
    result?: { entriesAdded?: number };
  }) => {
    success(
      `Import completed! Added ${status.result?.entriesAdded || 0} items to your knowledge base.`
    );
    // Refresh media files to show new content
    fetchMediaFiles();
  };

  const handleJobRemove = (jobId: string) => {
    setImportJobs((prev) => prev.filter((id) => id !== jobId));
  };

  const steps = [
    {
      number: 1,
      color: "bg-blue-500",
      title: "Add your social media URLs.",
      description:
        "Paste your YouTube, Instagram, Facebook, or LinkedIn profile URLs to import your content",
    },
    {
      number: 2,
      color: "bg-blue-500",
      title: "Echo transcribes and organizes your content.",
      description:
        "Once imported, Echo organizes and enriches your content automatically",
    },
    {
      number: 3,
      color: "bg-blue-500",
      title: "Your searchable Echosystem powers every new kit.",
      description:
        "The Knowledge Base is not where you manually browse content. It powers your outputs automatically.",
    },
  ];

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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-zinc-900 font-['Satoshi'] mb-4">
            Build Your Echosystem.
          </h1>
          <p className="text-xl text-stone-700 font-['Satoshi'] leading-relaxed max-w-2xl mx-auto mb-2">
            Build your Echosystem. Connect accounts or upload files — every
            piece strengthens your voice.
          </p>
          <p className="text-sm text-[#3a8e9c] font-medium font-['Satoshi']">
            Unmute Yourself.
          </p>
        </div>

        {/* Social Import Section */}
        <div className="bg-white rounded-[20px] p-8 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200 mb-12">
          <SocialImportSection onImportSuccess={handleImportSuccess} />
        </div>

        {isYouTubeConnected() && (
          <div className="bg-white rounded-[20px] p-8 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200 mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-[12px] flex items-center justify-center">
                  <Youtube size={24} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-semibold text-zinc-900 font-['Satoshi']">
                  YouTube Videos ({userVideos.length})
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const connectionData = localStorage.getItem(
                    "youtube_connection_data"
                  );
                  if (connectionData) {
                    try {
                      const data = JSON.parse(connectionData);
                      setIsSyncingVideos(true);
                      await youtubeConnectionService.syncVideo({
                        connectionId: data.connectionId,
                        maxResults: 20,
                      });
                      await fetchUserVideos();
                      success("Videos synced successfully!");
                    } catch (error) {
                      const errorMessage =
                        error instanceof Error
                          ? error.message
                          : "Unknown error";
                      showToastError(`Sync failed: ${errorMessage}`);
                    } finally {
                      setIsSyncingVideos(false);
                    }
                  }
                }}
                disabled={isSyncingVideos}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 flex items-center gap-2"
              >
                {isSyncingVideos ? (
                  <>
                    <Loader2 size={16} className="text-red-600 animate-spin" />
                    <span className="text-red-600 text-sm font-medium">
                      Syncing...
                    </span>
                  </>
                ) : (
                  <>
                    <Zap size={16} className="text-red-600" />
                    <span className="text-red-600 text-sm font-medium">
                      Sync Videos
                    </span>
                  </>
                )}
              </Button>
            </div>

            {isLoadingUserVideos ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 size={40} className="text-primary animate-spin" />
                </div>
                <p className="text-stone-500 font-['Satoshi'] text-lg">
                  Loading your YouTube videos...
                </p>
              </div>
            ) : userVideos.length > 0 ? (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {userVideos.slice(0, 9).map((video, index) => (
                  <div
                    key={index}
                    className="bg-stone-50 rounded-[16px] border border-stone-200 hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div
                      className="relative w-full"
                      style={{ paddingBottom: "56.25%" }}
                    >
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-zinc-900 font-['Satoshi'] mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-xs text-stone-500 font-['Satoshi'] mb-2">
                        {video.publishedAt
                          ? new Date(video.publishedAt).toLocaleDateString()
                          : "No date"}{" "}
                        •{" "}
                        {video.viewCount
                          ? `${(typeof video.viewCount === "number" ? video.viewCount : parseInt(video.viewCount)).toLocaleString()} views`
                          : "0 views"}
                      </p>
                      {video.description && (
                        <p className="text-xs text-stone-600 font-['Satoshi'] line-clamp-3">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video size={40} className="text-primary" />
                </div>
                <p className="text-stone-500 font-['Satoshi'] text-lg mb-2">
                  No YouTube videos found.
                </p>
                <p className="text-sm text-stone-400 font-['Satoshi']">
                  Your YouTube videos will appear here once they&apos;re synced.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Active Import Jobs */}
        {importJobs.length > 0 && (
          <div className="bg-white rounded-[20px] p-8 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-[12px] flex items-center justify-center">
                <Loader2 size={24} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 font-['Satoshi']">
                Active Imports ({importJobs.length})
              </h2>
            </div>
            <div className="space-y-4">
              {importJobs.map((jobId) => (
                <ImportJobTracker
                  key={jobId}
                  jobId={jobId}
                  onJobComplete={handleJobComplete}
                  onJobRemove={handleJobRemove}
                />
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-[20px] p-8 mb-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-[12px] flex items-center justify-center">
                <Zap size={24} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-blue-900 font-['Satoshi']">
                Get Started
              </h2>
            </div>
            <p className="text-lg text-blue-700 font-['Satoshi']">
              Add your social media profile URLs to begin building your
              Echosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-lg">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-blue-900 font-['Satoshi'] mb-2">
                  {step.title}
                </h3>
                <p className="text-blue-700 font-['Satoshi'] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-white rounded-[20px] p-8 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-zinc-900 font-['Satoshi']">
              Your Knowledge Base
            </h3>
            <div className="flex items-center gap-2">
              <ManualContentUpload
                onUploadSuccess={() => {
                  success("Writing sample uploaded successfully!");
                  fetchMediaFiles(); // Refresh the media list
                }}
                className="mr-2"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="border-[#d5d2cc] text-[#1c1c1e]"
              >
                {viewMode === "grid" ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid3X3 className="h-4 w-4" />
                )}
              </Button>
              <Dialog
                open={isSettingsModalOpen}
                onOpenChange={setIsSettingsModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#d5d2cc] text-[#1c1c1e]"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <h2 className="text-lg font-semibold">Media Settings</h2>
                  </DialogHeader>
                  <MediaSettings />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mb-6">
            <div
              className="bg-white rounded-[20px] p-8 border-2 border-dashed border-[#d5d2cc] transition-colors"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className={`text-center ${dragActive ? "opacity-100" : ""}`}>
                <Upload
                  size={48}
                  className={`mx-auto mb-4 ${dragActive ? "text-[#1c1c1e]" : "text-[#9b8baf]"}`}
                />
                <h3 className="text-xl font-semibold text-[#1c1c1e] font-['Satoshi'] mb-2">
                  Drop your media files here
                </h3>
                <p className="text-[#9b8baf] font-['Satoshi'] mb-4">
                  Or click to browse and select files from your computer
                </p>
                <div className="text-stone-500 text-xs mb-6">
                  Audio: max 10 min • Video: max 20 min
                </div>
                <Button
                  className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] px-6 py-3 rounded-[12px] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus size={18} className="mr-2" />
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
                <div className="mt-6 text-left">
                  <div className="text-[#1c1c1e] font-['Satoshi'] font-medium mb-3">
                    Uploaded File
                  </div>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white rounded-[12px] border border-stone-200 flex justify-between items-center gap-4"
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
                        className="p-1 hover:bg-stone-100 rounded-full"
                      >
                        <X className="w-4 h-4 text-stone-500" />
                      </button>
                    </div>
                  ))}

                  <Button
                    onClick={handleUpload}
                    disabled={uploading || isWaitingCompleteTranscripting}
                    className={`w-full mt-4 rounded-[12px] ${uploading || isWaitingCompleteTranscripting ? "bg-stone-300 cursor-not-allowed" : "bg-[#3a8e9c] hover:bg-[#2d7a85] text-white"}`}
                  >
                    {uploading || isWaitingCompleteTranscripting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {uploadStep === "getting-url" &&
                          "Getting Upload URL..."}
                        {uploadStep === "uploading-to-s3" &&
                          "Uploading to S3..."}
                        {uploadStep === "starting-transcription" &&
                          !isWaitingCompleteTranscripting &&
                          "Starting Transcription..."}
                        {uploadStep === "starting-pdf-processing" &&
                          "Starting PDF Processing..."}
                        {uploadStep === "completed" &&
                          (isWaitingCompleteTranscripting
                            ? isPdfFile
                              ? `PDF Processing: ${transcriptionStatus}`
                              : `Transcription: ${transcriptionStatus}`
                            : "Completed!")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Start Processing
                      </span>
                    )}
                  </Button>

                  {transcriptionData &&
                    transcriptionData.status === "COMPLETED" && (
                      <div className="w-full p-6 bg-green-50 border border-green-200 rounded-[12px] mt-4 text-left">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h3 className="text-green-800 text-lg font-medium">
                            {transcriptionData.extractedText
                              ? "PDF Text Extraction Completed"
                              : "Transcription Completed"}
                          </h3>
                        </div>
                        {transcriptionData.extractedText ? (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-green-700 font-medium">
                                Text Length:
                              </span>
                              <span className="text-green-800 font-medium">
                                {transcriptionData.textLength || 0} characters
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-green-700 font-medium">
                                Word Count:
                              </span>
                              <span className="text-green-800 font-medium">
                                {transcriptionData.wordCount || 0} words
                              </span>
                            </div>
                            <div className="mt-3">
                              <h4 className="text-green-700 text-sm font-medium mb-2">
                                Extracted Text:
                              </h4>
                              <div className="bg-white p-3 rounded border border-green-200 max-h-40 overflow-y-auto">
                                <p className="text-green-800 text-sm leading-relaxed">
                                  {transcriptionData.extractedText}
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-green-700 font-medium">
                                Confidence:
                              </span>
                              <span className="text-green-800 font-medium">
                                {(
                                  (transcriptionData.confidence || 0) * 100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-green-700 font-medium">
                                Duration:
                              </span>
                              <span className="text-green-800 font-medium">
                                {transcriptionData.completionTime &&
                                transcriptionData.startTime
                                  ? `${Math.round((new Date(transcriptionData.completionTime).getTime() - new Date(transcriptionData.startTime).getTime()) / 1000)}s`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="mt-3">
                              <h4 className="text-green-700 text-sm font-medium mb-2">
                                Transcript:
                              </h4>
                              <div className="bg-white p-3 rounded border border-green-200 max-h-40 overflow-y-auto">
                                <p className="text-green-800 text-sm leading-relaxed">
                                  {transcriptionData.transcript ||
                                    "No transcript available"}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error || ""}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 border-[#d5d2cc] text-[#1c1c1e] font-['Satoshi']"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={mediaTypeFilter}
                onValueChange={setMediaTypeFilter}
              >
                <SelectTrigger className="w-[180px] border-[#d5d2cc] text-[#1c1c1e] font-['Satoshi']">
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
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 size={40} className="text-primary animate-spin" />
              </div>
              <p className="text-stone-500 font-['Satoshi'] text-lg">
                Loading your media files...
              </p>
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
          ) : filteredMediaFiles.length > 0 ? (
            <div
              className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              {filteredMediaFiles.map((file) => (
                <div
                  key={file.id}
                  className={`p-4 bg-stone-50 rounded-[12px] border border-stone-200 hover:shadow-md transition-shadow ${viewMode === "list" ? "flex items-center gap-4" : ""}`}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-[8px] flex items-center justify-center flex-shrink-0">
                    {file.contentType?.startsWith("video/") ? (
                      <Video className="w-5 h-5 text-blue-600" />
                    ) : file.contentType?.startsWith("audio/") ? (
                      <Music className="w-5 h-5 text-blue-600" />
                    ) : (
                      <File className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-zinc-900 font-['Satoshi'] truncate">
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewFile(file)}
                      className="p-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={40} className="text-primary" />
              </div>
              <p className="text-stone-500 font-['Satoshi'] text-lg mb-2">
                No media files uploaded yet.
              </p>
              <p className="text-sm text-stone-400 font-['Satoshi']">
                Upload videos, audio files, or PDFs to start building your
                knowledge base.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
