"use client";

import React, { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import FileUpload from "@/components/molecules/file-upload";
import {
  FileText,
  Video,
  Link as LinkIcon,
  Database,
  X,
  Plus,
} from "lucide-react";
import { useGenerationStore, SourceType } from "@/stores/generation-store";
import { cn } from "@/utils/cn";

const sourceOptions = [
  {
    type: "text" as SourceType,
    icon: FileText,
    title: "Text / Idea",
    description: "Type or paste your content idea",
  },
  {
    type: "file" as SourceType,
    icon: Video,
    title: "Upload File",
    description: "Video, audio, or PDF files",
  },
  {
    type: "url" as SourceType,
    icon: LinkIcon,
    title: "External URL",
    description: "Import from web content",
  },
];

export function SourceStep() {
  const {
    sourceType,
    textInput,
    fileId,
    fileName,
    fileType,
    urls,
    useKnowledgeBase,
    setSourceType,
    setTextInput,
    setFile,
    clearFile,
    addUrl,
    removeUrl,
    toggleKnowledgeBase,
    nextStep,
  } = useGenerationStore();

  const [currentUrlInput, setCurrentUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [fileError, setFileError] = useState("");

  const handleFileUploaded = (
    uploadedFileId: string,
    uploadedFileName: string,
    uploadedFileType: string
  ) => {
    setFileError("");
    setFile(uploadedFileId, uploadedFileName, uploadedFileType);
  };

  const handleFileUploadError = (error: string) => {
    setFileError(error);
  };

  const handleAddUrl = () => {
    setUrlError("");
    const trimmedUrl = currentUrlInput.trim();

    if (!trimmedUrl) {
      setUrlError("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      const url = new URL(trimmedUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        setUrlError("URL must start with http:// or https://");
        return;
      }
    } catch {
      setUrlError("Please enter a valid URL");
      return;
    }

    addUrl(trimmedUrl);
    setCurrentUrlInput("");
  };

  const handleUrlKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUrl();
    }
  };

  const canProceed = () => {
    switch (sourceType) {
      case "text":
        return textInput.trim().length > 0;
      case "file":
        return fileId !== null;
      case "url":
        return urls.length > 0;
      case "knowledge_base":
        return useKnowledgeBase;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-medium text-zinc-900 mb-2">
          Choose Your Content Source
        </h2>
        <p className="text-stone-600">
          Select where your content will come from
        </p>
      </div>

      {/* Source Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sourceOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = sourceType === option.type;

          return (
            <button
              key={option.type}
              onClick={() => setSourceType(option.type)}
              className={cn(
                "relative p-6 rounded-[16px] border-2 transition-all text-left",
                "hover:border-[#3a8e9c] hover:shadow-sm",
                isSelected
                  ? "border-[#3a8e9c] bg-[#3a8e9c]/5"
                  : "border-stone-200 bg-white"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0",
                    isSelected
                      ? "bg-[#3a8e9c] text-white"
                      : "bg-stone-100 text-stone-600"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-zinc-900 mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-stone-600">{option.description}</p>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-[#3a8e9c] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Input Area based on selected source type */}
      <Card className="p-6">
        {sourceType === "text" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Enter Your Content or Idea
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your content idea, paste text, or describe what you want to create..."
                className="w-full h-[200px] p-4 bg-stone-50 rounded-[12px] border border-stone-200 focus:border-[#3a8e9c] focus:ring-2 focus:ring-[#3a8e9c]/20 outline-none resize-none text-zinc-900 placeholder:text-stone-500"
              />
            </div>
          </div>
        )}

        {sourceType === "file" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-4">
                Upload Your File
              </label>
              {!fileId ? (
                <>
                  <FileUpload
                    onFileUploaded={handleFileUploaded}
                    onUploadError={handleFileUploadError}
                    acceptedTypes={["video/*", "audio/*", "application/pdf"]}
                    maxFileSize={500}
                  />
                  {fileError && (
                    <p className="text-xs text-red-600 mt-2">{fileError}</p>
                  )}
                </>
              ) : (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-[12px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {fileType.startsWith("video/") ? (
                        <Video className="w-5 h-5 text-[#3a8e9c]" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#3a8e9c]" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-zinc-900">
                          {fileName}
                        </div>
                        <div className="text-xs text-stone-600">
                          File uploaded successfully
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFile}
                      className="text-stone-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {sourceType === "url" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Add URLs
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={currentUrlInput}
                  onChange={(e) => {
                    setCurrentUrlInput(e.target.value);
                    setUrlError("");
                  }}
                  onKeyPress={handleUrlKeyPress}
                  placeholder="Paste URL here..."
                  className="flex-1 h-10 px-4 bg-stone-50 rounded-[10px] border border-stone-200 focus:border-[#3a8e9c] focus:ring-2 focus:ring-[#3a8e9c]/20 outline-none text-sm text-zinc-900 placeholder:text-stone-500"
                />
                <Button
                  onClick={handleAddUrl}
                  className="bg-[#3a8e9c] hover:bg-[#2d7a85]"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              {urlError && (
                <p className="text-xs text-red-600 mt-1">{urlError}</p>
              )}
            </div>

            {urls.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-zinc-900">
                  Added URLs ({urls.length})
                </div>
                {urls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-[10px]"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <LinkIcon className="w-4 h-4 text-stone-500 flex-shrink-0" />
                      <span className="text-sm text-zinc-900 truncate">
                        {url}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUrl(url)}
                      className="text-stone-500 hover:text-red-600 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Knowledge Base Toggle */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-stone-100 rounded-[12px] flex items-center justify-center">
              <Database className="w-6 h-6 text-[#3a8e9c]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-900">
                Use Knowledge Base
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Include content from your knowledge base to enhance generation
              </p>
            </div>
          </div>
          <button
            onClick={toggleKnowledgeBase}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              useKnowledgeBase ? "bg-[#3a8e9c]" : "bg-stone-300"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                useKnowledgeBase ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-4 pt-6 border-t border-stone-200">
        <div className="text-sm text-stone-600 text-center sm:hidden">
          Step 1 of 3 • Choose your content source
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-sm text-stone-600 hidden sm:block">
            Step 1 of 3 • Choose your content source
          </div>
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="bg-[#3a8e9c] hover:bg-[#2d7a85] disabled:bg-stone-300 w-full sm:w-auto"
          >
            Continue to Audience
          </Button>
        </div>
      </div>
    </div>
  );
}
