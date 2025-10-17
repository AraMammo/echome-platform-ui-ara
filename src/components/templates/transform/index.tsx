"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/atoms/button";
import {
  Plus,
  Sparkles,
  Zap,
  FileText,
  Mail,
  Instagram,
  Linkedin,
  Twitter,
  Video,
  Mic,
  Download,
  X,
  Share2,
} from "lucide-react";

import { contentGenerationService } from "@/services/contentGenerationService";
import { getContentGenerationService } from "@/services/getContentGenerationService";
import { repurposeEngineService } from "@/services/repurposeEngineService";
import { contentKitService, ContentKitStatus } from "@/services/content-kit";
import { contentFormats } from "./contentFormats";
import { Loader } from "@/components/atoms/loader";
import FileUpload from "@/components/molecules/file-upload";
import ContentPreviewModal from "@/components/molecules/content-preview-modal";
import SocialPostButton from "@/components/molecules/social-post-button";
import ContentSuggestions from "@/components/molecules/content-suggestions";
import PostingAnalytics from "@/components/molecules/posting-analytics";
import { useAuthStore } from "@/stores/auth-store";
import { oauthService, ConnectedAccount } from "@/services/oauth";

export default function TransformTemplate() {
  const [inputValue, setInputValue] = useState("");
  const [selectedContentType] = useState("blog_post");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [originalJobId, setOriginalJobId] = useState<string | null>(null);
  const [isInitialGeneration, setIsInitialGeneration] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedFileType, setUploadedFileType] = useState<string>("");
  const [contentKitJobId, setContentKitJobId] = useState<string | null>(null);
  const [contentKitStatus, setContentKitStatus] =
    useState<ContentKitStatus | null>(null);
  const [isGeneratingContentKit, setIsGeneratingContentKit] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);

  // Get user from auth store
  const user = useAuthStore((state) => state.user);

  // Fetch connected accounts
  const fetchConnectedAccounts = useCallback(async () => {
    try {
      const response = await oauthService.getConnectedAccounts();
      setConnectedAccounts(response.connectedAccounts);
    } catch (error) {
      console.error("Error fetching connected accounts:", error);
    }
  }, []);

  // Input type options
  const inputTypeOptions = [
    {
      value: "text",
      label: "Text Input",
      icon: FileText,
      description: "Type or paste your content idea",
    },
    {
      value: "file",
      label: "Video/Audio Files",
      icon: Video,
      description: "Upload video or audio files",
    },
  ];

  // Context options for dropdown - Platform-specific options
  const contextOptions = [
    { value: "knowledge_base", label: "Knowledge Base", icon: FileText },
    { value: "tiktok", label: "TikTok", icon: Zap },
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "twitter", label: "Twitter", icon: Twitter },
    { value: "article", label: "Article/Blog", icon: FileText },
    { value: "linkedin", label: "LinkedIn", icon: Linkedin, comingSoon: true },
    { value: "youtube", label: "YouTube", icon: FileText, comingSoon: true },
  ];

  const [contextType, setContextType] = useState<string>("knowledge_base");
  const [externalUrls, setExternalUrls] = useState<string[]>([]);
  const [currentUrlInput, setCurrentUrlInput] = useState("");
  const [isExtractingUrls, setIsExtractingUrls] = useState(false);
  const [extractedContent, setExtractedContent] = useState<
    Record<
      string,
      {
        status: string;
        platform: string;
        url: string;
        metadata: {
          title: string;
          description: string;
          author: {
            username: string;
            displayName: string;
            verified: boolean;
          };
          hashtags?: string[];
          thumbnailUrl?: string;
          createdAt: string;
          content?: string;
          summary?: string;
        };
        extractedText: {
          captions?: string;
          ocrText?: string;
          content?: string;
          summary?: string;
        };
        processingTime: number;
      }
    >
  >({});
  const [urlValidationErrors, setUrlValidationErrors] = useState<
    Record<string, string>
  >({});
  const [generationHistory, setGenerationHistory] = useState<
    Array<{
      jobId: string;
      status: string;
      userPrompt?: string;
      originalPrompt?: string;
      generatedContent?: string;
      createdAt: string;
      updatedAt: string;
      iterationNumber: number;
      isOriginal?: boolean;
    }>
  >([]);

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const addUrl = async () => {
    if (
      currentUrlInput.trim() &&
      !externalUrls.includes(currentUrlInput.trim())
    ) {
      const url = currentUrlInput.trim();

      if (!repurposeEngineService.validateUrl(url)) {
        setUrlValidationErrors((prev) => ({
          ...prev,
          [url]: "Invalid URL format",
        }));
        return;
      }

      const detectedPlatform = repurposeEngineService.detectPlatform(url);
      if (!detectedPlatform) {
        setUrlValidationErrors((prev) => ({
          ...prev,
          [url]: "Unsupported platform",
        }));
        return;
      }

      setUrlValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[url];
        return newErrors;
      });

      setExternalUrls([...externalUrls, url]);
      setCurrentUrlInput("");

      if (
        [
          "linkedin",
          "youtube",
          "tiktok",
          "instagram",
          "twitter",
          "article",
        ].includes(contextType)
      ) {
        await extractUrlContent(url, detectedPlatform);
      }
    }
  };

  const extractUrlContent = async (url: string, platform: string) => {
    try {
      setIsExtractingUrls(true);
      const response = await repurposeEngineService.extractContent({
        url,
        platform,
      });

      setExtractedContent((prev) => ({
        ...prev,
        [url]: response,
      }));
    } catch (error) {
      console.error(`Failed to extract content from ${url}:`, error);
      setUrlValidationErrors((prev) => ({
        ...prev,
        [url]: "Failed to extract content",
      }));
    } finally {
      setIsExtractingUrls(false);
    }
  };

  const removeUrl = (urlToRemove: string) => {
    setExternalUrls(externalUrls.filter((url) => url !== urlToRemove));

    setExtractedContent((prev) => {
      const newContent = { ...prev };
      delete newContent[urlToRemove];
      return newContent;
    });

    setUrlValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[urlToRemove];
      return newErrors;
    });
  };

  const handleUrlInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addUrl();
    }
  };

  const contentTypes = [
    { key: "linkedin_post", label: "LinkedIn Post", icon: Linkedin },
    { key: "tweet", label: "Tweet", icon: Twitter },
    { key: "blog_post", label: "Blog Post", icon: FileText },
    { key: "email", label: "Email", icon: Mail },
    { key: "instagram_caption", label: "Instagram Caption", icon: Instagram },
  ];

  useEffect(() => {
    // Fetch connected accounts on mount
    fetchConnectedAccounts();
  }, [fetchConnectedAccounts]);

  const fetchGenerationHistory = useCallback(async () => {
    if (!originalJobId) return;

    try {
      const response =
        await contentGenerationService.getGenerationHistory(originalJobId);
      setGenerationHistory(response.data.regenerations || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, [originalJobId]);

  const handleFileUploaded = (
    fileId: string,
    fileName: string,
    fileType: string
  ) => {
    setUploadedFileId(fileId);
    setUploadedFileName(fileName);
    setUploadedFileType(fileType);
    setInputMode("file");
  };

  const handleFileUploadError = (error: string) => {
    console.error("File upload error:", error);
  };

  const handleGenerateContentKit = async () => {
    if (inputMode === "text" && !inputValue.trim()) {
      console.error("No text provided");
      return;
    }
    if (inputMode === "file" && !uploadedFileId) {
      console.error("No file uploaded");
      return;
    }

    // Debug user information
    console.log("User object:", user);
    console.log("User ID:", user?.id);
    console.log("User ID from localStorage:", localStorage.getItem("userId"));
    console.log("User ID from user object:", user?.id);

    setIsGeneratingContentKit(true);
    setContentKitJobId(null);
    setContentKitStatus(null);

    try {
      const request = {
        inputType:
          inputMode === "file"
            ? "video"
            : ("prompt" as "video" | "prompt" | "voice_note" | "social_import"),
        inputData: {
          ...(inputMode === "file" &&
            uploadedFileId && { fileId: uploadedFileId }),
          ...(inputMode === "text" &&
            inputValue.trim() && { text: inputValue.trim() }),
          userId:
            localStorage.getItem("userId") || user?.id || "anonymous-user",
        },
      };

      const response = await contentKitService.generateContentKit(request);
      setContentKitJobId(response.jobId);

      pollContentKitStatus(response.jobId);
    } catch (error) {
      console.error("Error generating content kit:", error);
      setIsGeneratingContentKit(false);
    }
  };

  const pollContentKitStatus = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await contentKitService.getContentKitStatus(jobId);
        setContentKitStatus(status);

        // Log when new content arrives for progressive updates
        if (status.outputs && Object.keys(status.outputs).length > 0) {
          console.log(
            "Content kit partial update:",
            Object.keys(status.outputs)
          );
        }

        if (status.status === "COMPLETED" || status.status === "FAILED") {
          clearInterval(pollInterval);
          setIsGeneratingContentKit(false);
        }
      } catch (error) {
        console.error("Error polling content kit status:", error);
        clearInterval(pollInterval);
        setIsGeneratingContentKit(false);
      }
    }, 1000); // Poll every 1 second for faster progressive updates
  };

  const handleDownloadContentKit = async () => {
    if (!contentKitJobId) return;

    try {
      const response =
        await contentKitService.downloadContentKit(contentKitJobId);
      const link = document.createElement("a");
      link.href = response.downloadUrl;
      link.download = `content-kit-${contentKitJobId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading content kit:", error);
    }
  };

  const handleCreateContent = async () => {
    if (originalJobId) {
      await handleRegenerateContent();
      return;
    }

    setIsLoadingContent(true);
    setIsLoadingContent(false);
    setGeneratedContent("");
    setJobId(null);
    setIsInitialGeneration(true);
    try {
      const selectedType = contentTypes.find(
        (type) => type.key === selectedContentType
      );
      if (!selectedType) throw new Error("Invalid content type selected");

      const contentType = contentFormats.find(
        (config) => config.outputFormat === selectedContentType
      );
      if (!contentType) throw new Error("Content type not found");

      const platformContexts = [
        "linkedin",
        "youtube",
        "tiktok",
        "instagram",
        "twitter",
        "article",
      ];
      const isPlatformContext = platformContexts.includes(contextType);

      let platformContent = undefined;
      if (isPlatformContext && externalUrls.length > 0) {
        platformContent = externalUrls
          .map((url) => extractedContent[url])
          .filter(Boolean);
      }

      const payload = {
        prompt: inputValue.trim(),
        outputFormat: selectedContentType,
        maxLength: contentType.maxLength,
        topic: inputValue.trim(),
        contextType: isPlatformContext ? "platform_content" : contextType,
        platform: isPlatformContext ? contextType : undefined,
        externalUrls:
          contextType === "external_url" || contextType === "both"
            ? externalUrls
            : undefined,
        platformContent: platformContent,
      };

      const response = await contentGenerationService.generateContent(payload);

      setJobId(response.jobId);
      setOriginalJobId(response.jobId);
      setIsLoadingContent(true);

      setTimeout(() => {
        fetchGenerationHistory();
      }, 1000);
    } catch (error) {
      console.error("Error generating content:", error);
      setGeneratedContent("Error generating content. Please try again.");
      setIsInitialGeneration(false);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleRegenerateContent = async () => {
    if (!originalJobId || !inputValue.trim()) return;

    setIsLoadingContent(true);
    try {
      await contentGenerationService.regenerateContent({
        originalJobId,
        userPrompt: inputValue.trim(),
      });

      await fetchGenerationHistory();
      setIsLoadingContent(false);
      setInputValue("");
    } catch (error) {
      console.error("Error regenerating content:", error);
      setGeneratedContent("Error regenerating content. Please try again.");
      setIsLoadingContent(false);
    } finally {
      // Regeneration complete
    }
  };

  useEffect(() => {
    if (!jobId || !isInitialGeneration) return;

    let pollInterval: NodeJS.Timeout | null = null;

    const fetchContentStatus = async () => {
      try {
        const result =
          await getContentGenerationService.getContentGenerationStatus(jobId);

        if (
          result.status?.toLowerCase() === "completed" &&
          result.generatedContent?.content
        ) {
          await fetchGenerationHistory();
          setIsLoadingContent(false);
          setIsInitialGeneration(false);
          setInputValue("");

          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        } else if (result.status?.toLowerCase() === "failed") {
          setGeneratedContent("Content generation failed. Please try again.");
          setIsLoadingContent(false);
          setIsInitialGeneration(false);
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        }
      } catch (error) {
        console.error("Status API Error:", error);
        setGeneratedContent(
          "Error checking generation status. Please try again."
        );
        setIsLoadingContent(false);
        setIsInitialGeneration(false);
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }
    };

    pollInterval = setInterval(fetchContentStatus, 2000);
    fetchContentStatus();

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [jobId, isInitialGeneration, fetchGenerationHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateContent();
  };

  const handleContentTypeSelect = (contentType: string) => {
    // Content type selection handled by UI state
    console.log("Content type selected:", contentType);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const audioFile = new File([audioBlob], "voice-recording.webm", {
          type: "audio/webm",
        });

        // Upload the audio file (simulate file upload)
        // You can integrate with your FileUpload component's logic here
        console.log("Voice recording completed", audioFile);

        // For now, just set some state to indicate recording was done
        // In production, you'd upload this file and set uploadedFileId
        setIsRecording(false);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting voice recording:", error);
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  return (
    <>
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl font-medium font-['Satoshi'] text-zinc-900">
                Ready to create? Let&apos;s turn your ideas into content.
              </h1>
            </div>
            <p className="text-lg text-stone-600 font-['Satoshi'] mb-1">
              Type an idea, upload a video, or paste a link to start.
            </p>
            <p className="text-sm text-[#3a8e9c] font-medium font-['Satoshi']">
              Unmute Yourself.
            </p>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area (Left - 2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="mb-8">
                <div className="relative bg-white rounded-[20px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {/* Input Mode Toggle */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={inputMode === "text" ? "default" : "outline"}
                        onClick={() => setInputMode("text")}
                        className={`h-10 px-4 rounded-[10px] font-medium ${
                          inputMode === "text"
                            ? "bg-[#3a8e9c] text-white hover:bg-[#2d7a85]"
                            : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                        }`}
                      >
                        <FileText size={16} className="mr-2" />
                        Text / Voice
                      </Button>
                      <Button
                        type="button"
                        variant={inputMode === "file" ? "default" : "outline"}
                        onClick={() => setInputMode("file")}
                        className={`h-10 px-4 rounded-[10px] font-medium ${
                          inputMode === "file"
                            ? "bg-[#3a8e9c] text-white hover:bg-[#2d7a85]"
                            : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                        }`}
                      >
                        <Video size={16} className="mr-2" />
                        Video / Audio File
                      </Button>
                    </div>

                    <div className="flex-1"></div>

                    {/* Knowledge Base Status Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-green-700">
                        Knowledge Base Active
                      </span>
                    </div>

                    {/* Social Media Connection Status */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                      <Share2 className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">
                        {connectedAccounts.length > 0
                          ? `${connectedAccounts.length} Platform${connectedAccounts.length > 1 ? "s" : ""} Connected`
                          : "No Social Accounts Connected"}
                      </span>
                    </div>
                  </div>

                  {/* Conditional Input Section */}
                  {inputMode === "text" ? (
                    <div className="mb-4">
                      <div className="relative">
                        <textarea
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Type an idea, paste content, or describe what you want to create... You can also record your voice using the mic button."
                          className="w-full h-[120px] p-4 pr-14 bg-stone-50 rounded-[12px] border border-stone-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none resize-none font-['Satoshi'] text-base text-zinc-900 placeholder:text-stone-500 overflow-y-auto"
                          style={{ fontFamily: "Satoshi, sans-serif" }}
                        />
                        <Button
                          type="button"
                          onClick={
                            isRecording
                              ? stopVoiceRecording
                              : startVoiceRecording
                          }
                          className={`absolute bottom-3 right-3 w-10 h-10 p-0 rounded-full ${
                            isRecording
                              ? "bg-red-500 hover:bg-red-600 animate-pulse"
                              : "bg-[#3a8e9c] hover:bg-[#2d7a85]"
                          } text-white transition-all`}
                          title={
                            isRecording
                              ? "Stop recording"
                              : "Start voice recording"
                          }
                        >
                          <Mic size={18} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <FileUpload
                        onFileUploaded={handleFileUploaded}
                        onUploadError={handleFileUploadError}
                        acceptedTypes={["video/*", "audio/*"]}
                        maxFileSize={500}
                      />

                      {uploadedFileId && (
                        <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {uploadedFileType.startsWith("video/") ? (
                                <Video className="h-5 w-5 text-[#3a8e9c]" />
                              ) : (
                                <Mic className="h-5 w-5 text-[#3a8e9c]" />
                              )}
                              <span className="text-sm font-medium text-stone-800">
                                {uploadedFileName} uploaded successfully
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setUploadedFileId(null);
                                setUploadedFileName("");
                                setUploadedFileType("");
                              }}
                              className="text-stone-500 hover:text-red-600 border-stone-300 hover:border-red-300"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content Kit Generation Section */}
                  {((inputMode === "text" && inputValue.trim()) ||
                    (inputMode === "file" && uploadedFileId)) && (
                    <div className="mb-4 p-4 bg-stone-50 border border-stone-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-stone-900">
                          Generate Complete Content Kit
                        </h3>
                        <Sparkles className="h-5 w-5 text-[#3a8e9c]" />
                      </div>
                      <p className="text-sm text-stone-700 mb-3">
                        Create a complete content package including blog posts,
                        social media content, video clips, and images from your{" "}
                        {inputMode === "file" ? "uploaded file" : "text input"}.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleGenerateContentKit}
                          disabled={isGeneratingContentKit}
                          className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
                        >
                          {isGeneratingContentKit ? (
                            <Loader size="sm" className="text-white mr-2" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                          )}
                          Generate Content Kit
                        </Button>
                        {contentKitStatus?.status === "COMPLETED" && (
                          <>
                            <Button
                              type="button"
                              onClick={() => setIsPreviewModalOpen(true)}
                              className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Preview & Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleDownloadContentKit}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Kit
                            </Button>
                          </>
                        )}

                        {/* Quick Social Post Buttons */}
                        {contentKitStatus?.status === "COMPLETED" &&
                          contentKitStatus.outputs && (
                            <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
                              <h4 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                                <Share2 className="h-4 w-4" />
                                Quick Post to Social Media
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {contentKitStatus.outputs.linkedInPost && (
                                  <SocialPostButton
                                    contentType="linkedin"
                                    content={
                                      contentKitStatus.outputs.linkedInPost
                                    }
                                    disabled={false}
                                  />
                                )}
                                {contentKitStatus.outputs.tweets && (
                                  <SocialPostButton
                                    contentType="tweet"
                                    content={contentKitStatus.outputs.tweets}
                                    disabled={false}
                                  />
                                )}
                                {contentKitStatus.outputs.facebookPost && (
                                  <SocialPostButton
                                    contentType="facebook"
                                    content={
                                      contentKitStatus.outputs.facebookPost
                                    }
                                    disabled={false}
                                  />
                                )}
                                {contentKitStatus.outputs.instagramCarousel &&
                                  contentKitStatus.outputs
                                    .instagramCarouselImages && (
                                    <SocialPostButton
                                      contentType="instagram"
                                      content={
                                        contentKitStatus.outputs
                                          .instagramCarousel
                                      }
                                      mediaUrls={
                                        contentKitStatus.outputs
                                          .instagramCarouselImages
                                      }
                                      disabled={false}
                                    />
                                  )}
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <p className="text-xs text-stone-600">
                                  💡 Connect your accounts in Settings to enable
                                  posting
                                </p>
                              </div>
                            </div>
                          )}
                      </div>

                      {contentKitStatus && (
                        <div className="mt-3 p-4 bg-white rounded-lg border border-stone-200">
                          {/* Kit Name */}
                          {contentKitStatus.kitName && (
                            <div className="mb-3 pb-3 border-b border-stone-200">
                              <h3 className="text-lg font-semibold text-zinc-900 font-['Satoshi']">
                                {contentKitStatus.kitName}
                              </h3>
                              <p className="text-xs text-stone-600 mt-1">
                                {
                                  Object.keys(contentKitStatus.outputs || {})
                                    .length
                                }{" "}
                                outputs generated
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-stone-900">
                              Status:
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                contentKitStatus.status === "COMPLETED"
                                  ? "text-green-600"
                                  : contentKitStatus.status === "FAILED"
                                    ? "text-red-600"
                                    : "text-[#3a8e9c]"
                              }`}
                            >
                              {contentKitStatus.status}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          {contentKitStatus.progress &&
                            contentKitStatus.status === "PROCESSING" && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-stone-900">
                                    {contentKitStatus.progress.currentStep}
                                  </span>
                                  <span className="text-sm text-stone-600">
                                    {contentKitStatus.progress.percentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-stone-200 rounded-full h-2">
                                  <div
                                    className="bg-[#3a8e9c] h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{
                                      width: `${contentKitStatus.progress.percentage}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="text-xs text-stone-600">
                                    Step{" "}
                                    {
                                      contentKitStatus.progress.completedSteps
                                        .length
                                    }{" "}
                                    of {contentKitStatus.progress.totalSteps}
                                  </div>
                                  {contentKitStatus.progress
                                    .estimatedTimeRemaining &&
                                    contentKitStatus.progress
                                      .estimatedTimeRemaining > 0 && (
                                      <div className="text-xs text-stone-600">
                                        ~
                                        {
                                          contentKitStatus.progress
                                            .estimatedTimeRemaining
                                        }{" "}
                                        min remaining
                                      </div>
                                    )}
                                </div>
                              </div>
                            )}

                          {/* Completed Steps */}
                          {contentKitStatus.progress &&
                            contentKitStatus.progress.completedSteps.length >
                              0 && (
                              <div className="mb-3">
                                <div className="text-xs font-medium text-stone-700 mb-2">
                                  Completed:
                                </div>
                                <div className="space-y-1">
                                  {contentKitStatus.progress.completedSteps.map(
                                    (step, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center text-xs text-green-600"
                                      >
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                                          <div className="w-1 h-1 bg-white rounded-full"></div>
                                        </div>
                                        {step}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Outputs Summary - Show progressively as content generates */}
                          {contentKitStatus.outputs &&
                            Object.keys(contentKitStatus.outputs).length >
                              0 && (
                              <div className="text-xs text-stone-600">
                                <div className="font-medium text-stone-700 mb-1 flex items-center gap-2">
                                  Generated Content:
                                  {contentKitStatus.status !== "COMPLETED" &&
                                    contentKitStatus.status !== "FAILED" && (
                                      <span className="text-[#3a8e9c] text-xs">
                                        (generating...)
                                      </span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                  {contentKitStatus.outputs.transcript && (
                                    <p>✓ Transcript</p>
                                  )}
                                  {contentKitStatus.outputs.blogPost && (
                                    <p>✓ Blog post</p>
                                  )}
                                  {contentKitStatus.outputs.linkedInPost && (
                                    <p>✓ LinkedIn post</p>
                                  )}
                                  {contentKitStatus.outputs.tweets && (
                                    <p>
                                      ✓ Tweet thread (
                                      {contentKitStatus.outputs.tweets.length}{" "}
                                      tweets)
                                    </p>
                                  )}
                                  {contentKitStatus.outputs
                                    .instagramCarousel && (
                                    <p>✓ Instagram carousel</p>
                                  )}
                                  {contentKitStatus.outputs.facebookPost && (
                                    <p>✓ Facebook post</p>
                                  )}
                                  {contentKitStatus.outputs.youtubeScript && (
                                    <p>✓ YouTube script</p>
                                  )}
                                  {contentKitStatus.outputs.newsletter && (
                                    <p>✓ Newsletter</p>
                                  )}
                                  {contentKitStatus.outputs.blogHeaderImage && (
                                    <p>✓ Blog header image</p>
                                  )}
                                  {contentKitStatus.outputs
                                    .instagramCarouselImages && (
                                    <p>
                                      ✓ Instagram carousel images (
                                      {
                                        contentKitStatus.outputs
                                          .instagramCarouselImages.length
                                      }
                                      )
                                    </p>
                                  )}
                                  {contentKitStatus.outputs.videoClips && (
                                    <p>
                                      ✓{" "}
                                      {
                                        contentKitStatus.outputs.videoClips
                                          .length
                                      }{" "}
                                      video clips
                                    </p>
                                  )}
                                </div>

                                {/* Generated Images Preview */}
                                {(contentKitStatus.outputs.blogHeaderImage ||
                                  (contentKitStatus.outputs
                                    .instagramCarouselImages &&
                                    contentKitStatus.outputs
                                      .instagramCarouselImages.length > 0)) && (
                                  <div className="mt-4 pt-4 border-t border-stone-200">
                                    <div className="text-xs font-medium text-stone-700 mb-3">
                                      Generated Images:
                                    </div>
                                    <div className="space-y-4">
                                      {/* Blog Header Image */}
                                      {contentKitStatus.outputs
                                        .blogHeaderImage && (
                                        <div>
                                          <p className="text-xs text-stone-600 mb-2 font-medium">
                                            Blog Header Image
                                          </p>
                                          <img
                                            src={
                                              contentKitStatus.outputs
                                                .blogHeaderImage
                                            }
                                            alt="Blog header"
                                            className="w-full h-auto rounded-lg border border-stone-200 hover:border-[#3a8e9c] transition-colors"
                                            onError={(e) => {
                                              const target =
                                                e.target as HTMLImageElement;
                                              target.style.display = "none";
                                            }}
                                          />
                                        </div>
                                      )}

                                      {/* Instagram Carousel Images */}
                                      {contentKitStatus.outputs
                                        .instagramCarouselImages &&
                                        contentKitStatus.outputs
                                          .instagramCarouselImages.length >
                                          0 && (
                                          <div>
                                            <p className="text-xs text-stone-600 mb-2 font-medium">
                                              Instagram Carousel Images (
                                              {
                                                contentKitStatus.outputs
                                                  .instagramCarouselImages
                                                  .length
                                              }
                                              )
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                              {contentKitStatus.outputs.instagramCarouselImages.map(
                                                (imgUrl, idx) => (
                                                  <img
                                                    key={idx}
                                                    src={imgUrl}
                                                    alt={`Instagram carousel ${idx + 1}`}
                                                    className="w-full aspect-square object-cover rounded-lg border border-stone-200 hover:border-[#3a8e9c] transition-colors"
                                                    onError={(e) => {
                                                      const target =
                                                        e.target as HTMLImageElement;
                                                      target.style.display =
                                                        "none";
                                                    }}
                                                  />
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  )}

                  {(contextType === "external_url" ||
                    contextType === "both" ||
                    [
                      "linkedin",
                      "youtube",
                      "tiktok",
                      "instagram",
                      "twitter",
                      "article",
                    ].includes(contextType)) && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-zinc-900 font-['Satoshi']">
                          {contextType === "external_url" ||
                          contextType === "both"
                            ? "External URLs"
                            : `${repurposeEngineService.getPlatformDisplayName(contextType)} URLs`}
                        </span>
                        {isExtractingUrls && (
                          <Loader size="sm" className="text-[#3a8e9c]" />
                        )}
                      </div>

                      <div className="flex gap-2 mb-3">
                        <input
                          type="url"
                          value={currentUrlInput}
                          onChange={(e) => setCurrentUrlInput(e.target.value)}
                          onKeyPress={handleUrlInputKeyPress}
                          placeholder={`Paste ${contextType === "external_url" || contextType === "both" ? "any" : repurposeEngineService.getPlatformDisplayName(contextType)} URL here...`}
                          className="flex-1 px-3 py-2 bg-stone-50 rounded-[8px] border border-stone-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none font-['Satoshi'] text-sm text-zinc-900 placeholder:text-stone-500"
                        />
                        <Button
                          type="button"
                          onClick={addUrl}
                          disabled={!currentUrlInput.trim() || isExtractingUrls}
                          className="px-4 py-2 bg-[#3a8e9c] hover:bg-[#2d7a85] text-white rounded-[8px] font-medium disabled:bg-stone-300"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>

                      {externalUrls.length > 0 && (
                        <div className="space-y-2">
                          {externalUrls.map((url, index) => {
                            const extracted = extractedContent[url];
                            const error = urlValidationErrors[url];
                            const detectedPlatform =
                              repurposeEngineService.detectPlatform(url);

                            return (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-stone-50 rounded-[8px] border border-stone-200"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-stone-600 font-['Satoshi']">
                                      {detectedPlatform
                                        ? repurposeEngineService.getPlatformDisplayName(
                                            detectedPlatform
                                          )
                                        : "Unknown Platform"}
                                    </span>
                                    {extracted && (
                                      <span className="text-xs text-green-600 font-medium">
                                        ✓ Extracted
                                      </span>
                                    )}
                                    {error && (
                                      <span className="text-xs text-red-600 font-medium">
                                        ✗ {error}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-zinc-900 font-['Satoshi'] truncate">
                                    {url}
                                  </p>
                                  {extracted && (
                                    <div className="mt-2 text-xs text-stone-600">
                                      <p className="font-medium">
                                        {extracted.metadata?.title}
                                      </p>
                                      {extracted.metadata?.description && (
                                        <p className="mt-1 line-clamp-2">
                                          {extracted.metadata.description}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => removeUrl(url)}
                                  variant="outline"
                                  size="sm"
                                  className="text-stone-500 hover:text-red-600 border-stone-300 hover:border-red-300"
                                >
                                  ×
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {(generatedContent ||
                    isLoadingContent ||
                    generationHistory.length > 0) && (
                    <div className="bg-white rounded-[12px] border border-stone-200 p-4 max-h-[600px] flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-zinc-900 font-['Satoshi']">
                          Generated Content
                        </h3>
                      </div>

                      <div
                        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden"
                        style={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                      >
                        <div className="w-full flex flex-col gap-4">
                          {(() => {
                            const formatContent = (
                              content: string | undefined | null
                            ) => {
                              if (!content) return "";
                              return content
                                .replace(
                                  /\*\*(.*?)\*\*/g,
                                  "<strong>$1</strong>"
                                )
                                .replace(/\n\n/g, "<br><br>")
                                .replace(/\n/g, "<br>")
                                .replace(
                                  /#(\w+)/g,
                                  '<span class="text-blue-600 font-medium">#$1</span>'
                                );
                            };

                            if (generationHistory.length > 0) {
                              return generationHistory
                                .sort((a, b) => {
                                  const aIter = a.iterationNumber || 0;
                                  const bIter = b.iterationNumber || 0;
                                  return aIter - bIter;
                                })
                                .map((item, index) => {
                                  return (
                                    <div
                                      key={`${item.jobId}-${index}`}
                                      className="border-b border-stone-100 pb-4"
                                    >
                                      <div className="w-full pr-4 flex flex-col justify-end items-end mb-2">
                                        <div className="w-[70%] text-sm text-stone-600 font-['Satoshi'] font-bold leading-relaxed bg-stone-50 p-3 rounded-lg">
                                          {item.userPrompt ||
                                            item.originalPrompt ||
                                            "User prompt"}
                                        </div>
                                      </div>

                                      {item.generatedContent && (
                                        <div className="w-full flex flex-col justify-start items-start">
                                          <div
                                            className="w-[80%] text-stone-700 font-['Satoshi'] leading-relaxed bg-[#fafaf9] p-3 rounded-lg"
                                            dangerouslySetInnerHTML={{
                                              __html: formatContent(
                                                item.generatedContent
                                              ),
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                });
                            }

                            if (generatedContent) {
                              return (
                                <div className="border-b border-stone-100 pb-4">
                                  <div className="w-full pr-4 flex flex-col justify-end items-end mb-2">
                                    <div className="w-[70%] text-sm text-stone-600 font-['Satoshi'] font-bold leading-relaxed bg-stone-50 p-3 rounded-lg">
                                      {inputValue}
                                    </div>
                                  </div>
                                  <div className="w-full flex flex-col justify-start items-start">
                                    <div
                                      className="w-[80%] text-stone-700 font-['Satoshi'] leading-relaxed bg-[#fafaf9] p-3 rounded-lg"
                                      dangerouslySetInnerHTML={{
                                        __html: formatContent(generatedContent),
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            }

                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[20px] p-6 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-stone-100 rounded-[12px] flex items-center justify-center">
                      <Sparkles size={24} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 font-['Satoshi']">
                      Create Content in Your Voice
                    </h3>
                  </div>
                  <p className="text-stone-600 font-['Satoshi'] leading-relaxed">
                    Say it once - Echo builds your kit in seconds. Fast,
                    ready-to-publish outputs across every platform. Your
                    Echosystem powers every creation.
                  </p>
                </div>

                <div className="bg-white rounded-[20px] p-6 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-stone-100 rounded-[12px] flex items-center justify-center">
                      <Zap size={24} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 font-['Satoshi']">
                      Three Starting Paths
                    </h3>
                  </div>
                  <ul className="text-stone-600 font-['Satoshi'] leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#3a8e9c] font-bold mt-1">•</span>
                      <span>Upload video → Content Creator Kit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#3a8e9c] font-bold mt-1">•</span>
                      <span>
                        Type/paste idea → Ideas-to-Content (No video required)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#3a8e9c] font-bold mt-1">•</span>
                      <span>Monitor external content → Repurpose Engine</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Close main content area and add sidebar */}
            </div>

            {/* Right Sidebar - Smart Posting Suggestions (1 column) */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {contentKitStatus?.status === "COMPLETED" &&
                contentKitStatus.outputs ? (
                  <>
                    <ContentSuggestions
                      contentKit={contentKitStatus}
                      connectedAccounts={connectedAccounts}
                    />
                    <PostingAnalytics connectedAccounts={connectedAccounts} />
                  </>
                ) : (
                  <div className="bg-white rounded-[20px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-stone-100 rounded-[12px] flex items-center justify-center">
                        <Sparkles size={20} className="text-[#3a8e9c]" />
                      </div>
                      <h3 className="text-lg font-semibold text-zinc-900 font-['Satoshi']">
                        Smart Posting Suggestions
                      </h3>
                    </div>
                    <p className="text-sm text-stone-600 font-['Satoshi']">
                      AI-powered recommendations for optimal content
                      distribution will appear here once you generate your
                      content kit.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Preview & Edit Modal */}
      <ContentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        contentKit={contentKitStatus}
        onSave={(updatedOutputs) => {
          if (contentKitStatus) {
            setContentKitStatus({
              ...contentKitStatus,
              outputs: updatedOutputs,
            });
          }
        }}
      />
    </>
  );
}
