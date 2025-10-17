"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import {
  Upload,
  Download,
  Search,
  Grid3X3,
  List,
  Eye,
  Heart,
  Video,
  Plus,
  Settings,
  ChevronDown,
  File,
  Music,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import {
  fileUploadService,
  s3UploadService,
  transcriptionService,
  transcriptionStatusService,
  startPdfProcessingJobService,
  FileUploadServiceError,
  S3UploadServiceError,
  TranscriptionServiceError,
  TranscriptionStatusServiceError,
  StartPdfProcessingJobError,
  pdfStatusService,
  PdfStatusServiceError,
  mediaService,
  MediaServiceError,
  MediaFile,
} from "@/services";
import { useAuthStore } from "@/stores/auth-store";

export default function MediaTemplate() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("All Types");

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topFileInputRef = useRef<HTMLInputElement>(null);
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

  const fetchMediaFiles = async () => {
    try {
      console.log("Fetching media files...");
      setMediaLoading(true);
      setMediaError(null);

      const response = await mediaService.getFiles();

      const files = response.data || [];
      setMediaFiles(files);
      console.log("Set media files:", files);
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

  useEffect(() => {
    console.log(
      "MediaTemplate useEffect - isAuthenticated:",
      isAuthenticated,
      "authLoading:",
      authLoading
    );

    if (!authLoading && isAuthenticated) {
      console.log(
        "MediaTemplate - User is authenticated, fetching media files"
      );
      fetchMediaFiles();
    } else if (!authLoading && !isAuthenticated) {
      console.log(
        "MediaTemplate - User is not authenticated, skipping media fetch"
      );
      setMediaLoading(false);
      setMediaError("Please sign in to view your media files");
    }
  }, [isAuthenticated, authLoading]);

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

      const file = uploadedFiles[0];

      try {
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
          // Refresh media files after upload
          setTimeout(() => fetchMediaFiles(), 1000);
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
          setTimeout(() => fetchMediaFiles(), 1000);
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
  }, [uploading, uploadStep, uploadedFiles, uploadData, ALLOWED_TYPES.pdf]);

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

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/"))
      return <Video className="w-6 h-6 text-blue-500" />;
    if (file.type.startsWith("audio/"))
      return <Music className="w-6 h-6 text-green-500" />;
    return <File className="w-6 h-6 text-red-500" />;
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const mediaCategories = [
    "All Categories",
    "Videos",
    "Images",
    "Audio",
    "Documents",
    "Social Media",
  ];
  const mediaTypes = [
    "All Types",
    "Original",
    "Generated",
    "Imported",
    "Archived",
  ];

  const filteredMediaFiles = mediaFiles.filter((file) => {
    const matchesSearch =
      !searchQuery ||
      file.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "All Categories" ||
      (categoryFilter === "Videos" && file.contentType.startsWith("video/")) ||
      (categoryFilter === "Images" && file.contentType.startsWith("image/")) ||
      (categoryFilter === "Audio" && file.contentType.startsWith("audio/")) ||
      (categoryFilter === "Documents" && file.contentType.includes("pdf")) ||
      (categoryFilter === "Social Media" &&
        file.contentType.includes("social"));

    const matchesType =
      mediaTypeFilter === "All Types" ||
      (mediaTypeFilter === "Original" && file.status === "COMPLETED") ||
      (mediaTypeFilter === "Generated" && file.status === "PROCESSING") ||
      (mediaTypeFilter === "Imported" && file.status === "PENDING") ||
      (mediaTypeFilter === "Archived" && file.status === "FAILED");

    return matchesSearch && matchesCategory && matchesType;
  });

  const totalMedia = mediaFiles.length;
  const totalStorageMB = mediaFiles.reduce(
    (sum, file) => sum + file.size / 1024 / 1024,
    0
  );
  const completedFiles = mediaFiles.filter(
    (file) => file.status === "COMPLETED"
  ).length;
  const processingFiles = mediaFiles.filter(
    (file) => file.status === "PROCESSING"
  ).length;

  const mediaStats = [
    {
      title: "Total Media",
      value: totalMedia.toString(),
      icon: Grid3X3,
      color: "text-[#3a8e9c]",
      bgColor: "bg-[#3a8e9c]/10",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Storage Used",
      value: `${totalStorageMB.toFixed(1)} MB`,
      icon: Download,
      color: "text-[#9b8baf]",
      bgColor: "bg-[#9b8baf]/10",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Completed",
      value: completedFiles.toString(),
      icon: CheckCircle,
      color: "text-[#b4a398]",
      bgColor: "bg-[#b4a398]/10",
      change: "+23%",
      changeType: "positive",
    },
    {
      title: "Processing",
      value: processingFiles.toString(),
      icon: Heart,
      color: "text-[#3a8e9c]",
      bgColor: "bg-[#3a8e9c]/10",
      change: "+5%",
      changeType: "positive",
    },
  ];

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div>
            <h1 className="text-4xl font-bold text-[#1c1c1e] font-['Satoshi'] mb-2">
              Media
            </h1>
            <p className="text-lg text-[#9b8baf] font-['Satoshi'] mb-1">
              Upload your own files (videos, podcasts, docs) to strengthen your
              Echosystem. Every file makes your voice more powerful.
            </p>
            <p className="text-sm text-[#3a8e9c] font-medium font-['Satoshi']">
              Unmute Yourself.
            </p>
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <Button
              className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi']"
              onClick={() => topFileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                <>
                  <Upload size={18} className="mr-2" />
                  Upload Media
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#d5d2cc] text-[#1c1c1e] hover:bg-[#3a8e9c] hover:text-white hover:border-[#3a8e9c] transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed disabled:hover:bg-stone-300 disabled:hover:text-[#1c1c1e] disabled:hover:border-[#d5d2cc]"
            >
              <Settings size={18} />
            </Button>
          </div>
        </div>

        {/* Media Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mediaStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-[20px] p-6 border border-[#d5d2cc] hover:border-[#3a8e9c] transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.bgColor} rounded-[12px] flex items-center justify-center`}
                >
                  <stat.icon size={24} className={stat.color} />
                </div>
                <div className="text-green-600 text-xs font-medium">
                  {stat.change}
                </div>
              </div>
              <div
                className={`text-3xl font-bold ${stat.color} font-['Satoshi'] mb-2`}
              >
                {stat.value}
              </div>
              <p className="text-[#1c1c1e] font-['Satoshi'] font-medium">
                {stat.title}
              </p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-[20px] p-6 border border-[#d5d2cc]">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9b8baf]"
              />
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-[#f3f1ec] rounded-[12px] border border-[#d5d2cc] focus:border-[#3a8e9c] outline-none font-['Satoshi'] placeholder:text-[#9b8baf] transition-colors"
              />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-12 px-4 pr-10 bg-[#f3f1ec] rounded-[12px] border border-[#d5d2cc] focus:border-[#3a8e9c] outline-none font-['Satoshi'] text-[#1c1c1e] appearance-none cursor-pointer"
              >
                {mediaCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9b8baf] pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                value={mediaTypeFilter}
                onChange={(e) => setMediaTypeFilter(e.target.value)}
                className="h-12 px-4 pr-10 bg-[#f3f1ec] rounded-[12px] border border-[#d5d2cc] focus:border-[#3a8e9c] outline-none font-['Satoshi'] text-[#1c1c1e] appearance-none cursor-pointer"
              >
                {mediaTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9b8baf] pointer-events-none"
              />
            </div>

            <div className="flex border border-[#d5d2cc] rounded-[12px] overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 ${viewMode === "grid" ? "bg-[#3a8e9c] text-white" : "bg-[#f3f1ec] text-[#9b8baf]"}`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 ${viewMode === "list" ? "bg-[#3a8e9c] text-white" : "bg-[#f3f1ec] text-[#9b8baf]"}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {mediaLoading ? (
          <div className="col-span-full bg-white rounded-[20px] p-8 border border-[#d5d2cc]">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-[#f3f1ec] rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3a8e9c]"></div>
              </div>
              <h3 className="text-xl font-semibold text-[#1c1c1e] font-['Satoshi'] mb-2">
                Loading media files...
              </h3>
            </div>
          </div>
        ) : mediaError ? (
          <div className="col-span-full bg-white rounded-[20px] p-8 border border-[#d5d2cc]">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={48} className="text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-[#1c1c1e] font-['Satoshi'] mb-2">
                {mediaError}
              </h3>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] mt-4"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMediaFiles.length === 0 ? (
              <div className="col-span-full bg-white rounded-[20px] p-8 border border-[#d5d2cc]">
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-[#f3f1ec] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload size={48} className="text-[#9b8baf]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1c1c1e] font-['Satoshi'] mb-2">
                    No files yet. Upload media to build your content library.
                  </h3>
                </div>
              </div>
            ) : (
              filteredMediaFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-[20px] p-6 border border-[#d5d2cc] hover:border-[#3a8e9c] transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-[#f3f1ec] rounded-[12px] flex items-center justify-center">
                      {file.contentType.startsWith("video/") ? (
                        <Video className="w-6 h-6 text-blue-500" />
                      ) : file.contentType.startsWith("audio/") ? (
                        <Music className="w-6 h-6 text-green-500" />
                      ) : (
                        <File className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        file.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : file.status === "PROCESSING"
                            ? "bg-yellow-100 text-yellow-800"
                            : file.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {file.status}
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-[#1c1c1e] font-['Satoshi'] mb-2 truncate">
                    {file.fileName}
                  </h4>
                  <p className="text-sm text-[#9b8baf] font-['Satoshi'] mb-4">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#9b8baf] font-['Satoshi']">
                      {file.size >= 1024 * 1024
                        ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                        : `${(file.size / 1024).toFixed(1)} KB`}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#d5d2cc] text-[#1c1c1e] hover:bg-[#3a8e9c] hover:text-white hover:border-[#3a8e9c]"
                      onClick={() => handleViewFile(file)}
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[20px] border border-[#d5d2cc] overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#1c1c1e] font-['Satoshi'] mb-4">
                Media List View
              </h3>
              <div className="space-y-4">
                {filteredMediaFiles.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-[#f3f1ec] rounded-full flex items-center justify-center mx-auto mb-6">
                      <Upload size={48} className="text-[#9b8baf]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#1c1c1e] font-['Satoshi'] mb-2">
                      No files yet. Upload media to strengthen your Echosystem.
                    </h3>
                  </div>
                ) : (
                  filteredMediaFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-[#f3f1ec] rounded-[12px] border border-[#d5d2cc] hover:border-[#3a8e9c] transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-[8px] flex items-center justify-center">
                          {file.contentType.startsWith("video/") ? (
                            <Video className="w-5 h-5 text-blue-500" />
                          ) : file.contentType.startsWith("audio/") ? (
                            <Music className="w-5 h-5 text-green-500" />
                          ) : (
                            <File className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#1c1c1e] font-['Satoshi']">
                            {file.fileName}
                          </h4>
                          <p className="text-xs text-[#9b8baf] font-['Satoshi']">
                            {new Date(file.uploadedAt).toLocaleDateString()} •{" "}
                            {file.size >= 1024 * 1024
                              ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                              : `${(file.size / 1024).toFixed(1)} KB`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            file.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : file.status === "PROCESSING"
                                ? "bg-yellow-100 text-yellow-800"
                                : file.status === "FAILED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {file.status}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#d5d2cc] text-[#1c1c1e] hover:bg-[#3a8e9c] hover:text-white hover:border-[#3a8e9c]"
                          onClick={() => handleViewFile(file)}
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

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
            {/* <div className="text-stone-500 text-sm mb-1">
              PDF (50MB), Audio (MP3, WAV, M4A, AAC, OGG, FLAC, WebM - 100MB), Video (MP4, MOV, AVI, WebM, MPEG, WMV, FLV, 3GP, MKV - 500MB)
            </div> */}
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
                    {uploadStep === "getting-url" && "Getting Upload URL..."}
                    {uploadStep === "uploading-to-s3" && "Uploading to S3..."}
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
        </div>

        {error && (
          <div className="fixed top-4 right-4 z-50 max-w-sm">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
