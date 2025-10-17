"use client";

import React, { useState } from "react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Input } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
// Textarea component inline (if not available in atoms)
import { Upload, Loader2, CheckCircle, FileText } from "lucide-react";
import {
  knowledgeBaseService,
  UploadContentRequest,
} from "@/services/knowledge-base";
import { useToast } from "@/components/atoms/toast";

interface ManualContentUploadProps {
  onUploadSuccess?: (contentId: string) => void;
  className?: string;
}

export default function ManualContentUpload({
  onUploadSuccess,
  className = "",
}: ManualContentUploadProps) {
  const { success, error: showToastError } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    contentType: UploadContentRequest["contentType"];
    tags: string;
  }>({
    title: "",
    content: "",
    contentType: "other",
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      showToastError("Content is required");
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const payload: UploadContentRequest = {
        content: formData.content,
        title: formData.title || "Untitled",
        contentType: formData.contentType,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      const response = await knowledgeBaseService.uploadContent(payload);

      setUploadSuccess(true);
      success(
        `Content uploaded successfully! ${response.vectorCount} vector(s) created.`
      );

      // Reset form
      setFormData({
        title: "",
        content: "",
        contentType: "other",
        tags: "",
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setUploadSuccess(false);
        if (onUploadSuccess) {
          onUploadSuccess(response.contentId);
        }
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      showToastError(
        error instanceof Error ? error.message : "Failed to upload content"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className={className}>
          <FileText className="w-4 h-4 mr-2" />
          Add Writing Sample
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Writing Sample to Knowledge Base</DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            Upload your writing to help personalize content generation. This
            content will be used to understand your style and tone.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title (Optional)
            </label>
            <Input
              id="title"
              placeholder="e.g., My LinkedIn Post Example"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={isUploading}
            />
          </div>

          {/* Content Type */}
          <div>
            <label
              htmlFor="contentType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content Type
            </label>
            <Select
              value={formData.contentType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  contentType: value as UploadContentRequest["contentType"],
                })
              }
              disabled={isUploading}
            >
              <SelectTrigger id="contentType">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog_post">Blog Post</SelectItem>
                <SelectItem value="linkedin_post">LinkedIn Post</SelectItem>
                <SelectItem value="tweet">Tweet/X Post</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="instagram_caption">
                  Instagram Caption
                </SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              placeholder="Paste your writing sample here..."
              rows={12}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              disabled={isUploading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-y disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length} characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags (Optional)
            </label>
            <Input
              id="tags"
              placeholder="e.g., professional, technical, casual (comma-separated)"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              disabled={isUploading}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || uploadSuccess}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : uploadSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Uploaded!
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload to Knowledge Base
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
