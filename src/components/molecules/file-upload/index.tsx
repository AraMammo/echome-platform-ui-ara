"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/atoms/button";
import { Upload, X, FileVideo, FileAudio, FileText, Mail } from "lucide-react";
import { fileUploadService } from "@/services/file-upload";
import { s3UploadService } from "@/services/s3-upload";

interface FileUploadProps {
  onFileUploaded: (fileId: string, fileName: string, fileType: string) => void;
  onUploadError: (error: string) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
  className?: string;
}

interface UploadedFile {
  file: File;
  fileId?: string;
  uploadStatus: "pending" | "uploading" | "completed" | "error";
  error?: string;
  uploadProgress?: number;
}

export default function FileUpload({
  onFileUploaded,
  onUploadError,
  acceptedTypes = [
    "video/*",
    "audio/*",
    "application/pdf",
    "application/mbox",
    ".mbox",
  ],
  maxFileSize = 500,
  className = "",
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
        file,
        uploadStatus: "pending",
      }));

      const validFiles: UploadedFile[] = [];
      const errors: string[] = [];

      newFiles.forEach((uploadedFile) => {
        const { file } = uploadedFile;
        if (file.size > maxFileSize * 1024 * 1024) {
          errors.push(
            `${file.name} is too large. Maximum size is ${maxFileSize}MB.`
          );
          return;
        }

        const isValidType = acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.slice(0, -1));
          }
          if (type.startsWith(".")) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type === type;
        });

        if (!isValidType) {
          errors.push(`${file.name} is not a supported file type.`);
          return;
        }

        validFiles.push(uploadedFile);
      });

      if (errors.length > 0) {
        onUploadError(errors.join(" "));
      }

      if (validFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [acceptedTypes, maxFileSize, onUploadError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const uploadFile = async (uploadedFile: UploadedFile) => {
    try {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === uploadedFile.file ? { ...f, uploadStatus: "uploading" } : f
        )
      );

      const { file } = uploadedFile;

      const uploadData = await Promise.race([
        fileUploadService.getUploadUrl(file.name, file.type),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Upload URL request timed out")),
            10000
          )
        ),
      ]);

      const fileSizeMB = file.size / (1024 * 1024);
      const dynamicTimeout = Math.max(120000, fileSizeMB * 30000); // 30 seconds per MB, min 2 minutes

      console.log(
        `Uploading ${fileSizeMB.toFixed(1)}MB file with ${(dynamicTimeout / 1000).toFixed(0)}s timeout`
      );

      await s3UploadService.uploadToS3(
        uploadData.uploadUrl,
        file,
        (progress) => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.file === uploadedFile.file
                ? { ...f, uploadProgress: progress }
                : f
            )
          );
        },
        dynamicTimeout
      );

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === uploadedFile.file
            ? { ...f, fileId: uploadData.fileId, uploadStatus: "completed" }
            : f
        )
      );

      onFileUploaded(uploadData.fileId, file.name, file.type);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === uploadedFile.file
            ? { ...f, uploadStatus: "error", error: errorMessage }
            : f
        )
      );

      onUploadError(errorMessage);
    }
  };

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles((prev) => prev.filter((f) => f.file !== fileToRemove));
  };

  const getFileIcon = (fileType: string, fileName?: string) => {
    if (fileType.startsWith("video/")) return FileVideo;
    if (fileType.startsWith("audio/")) return FileAudio;
    if (
      fileType === "application/mbox" ||
      fileName?.toLowerCase().endsWith(".mbox")
    )
      return Mail;
    return FileText;
  };

  const getFileTypeLabel = (fileType: string, fileName?: string) => {
    if (fileType.startsWith("video/")) return "Video";
    if (fileType.startsWith("audio/")) return "Audio";
    if (fileType === "application/pdf") return "PDF";
    if (
      fileType === "application/mbox" ||
      fileName?.toLowerCase().endsWith(".mbox")
    )
      return "MBOX (Email Archive)";
    return "File";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-[#3a8e9c] bg-stone-50"
            : "border-stone-300 hover:border-stone-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-stone-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-stone-900">
            Upload video, audio, PDF, or email archives
          </p>
          <p className="text-sm text-stone-500">
            Drag and drop files here, or click to select
          </p>
          <p className="text-xs text-stone-400">
            Supports .mp4, .mp3, .pdf, .mbox (Google Takeout)
          </p>
          <p className="text-xs text-stone-500 mt-1">
            Maximum file size: {maxFileSize}MB
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = acceptedTypes.join(",");
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              handleFileSelect(target.files);
            };
            input.click();
          }}
        >
          Select Files
        </Button>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Uploaded Files</h3>
          {uploadedFiles.map((uploadedFile, index) => {
            const { file, uploadStatus, error, uploadProgress } = uploadedFile;
            const FileIcon = getFileIcon(file.type, file.name);
            const fileTypeLabel = getFileTypeLabel(file.type, file.name);

            return (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fileTypeLabel} • {(file.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                    {uploadStatus === "uploading" &&
                      uploadProgress !== undefined && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#3a8e9c] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {uploadStatus === "pending" && (
                    <Button size="sm" onClick={() => uploadFile(uploadedFile)}>
                      Upload
                    </Button>
                  )}
                  {uploadStatus === "uploading" && (
                    <div className="text-sm text-[#3a8e9c]">
                      {uploadProgress !== undefined
                        ? `${uploadProgress.toFixed(0)}%`
                        : "Uploading..."}
                    </div>
                  )}
                  {uploadStatus === "completed" && (
                    <div className="text-sm text-green-600">✓ Uploaded</div>
                  )}
                  {uploadStatus === "error" && (
                    <div className="text-sm text-red-600">Error: {error}</div>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
