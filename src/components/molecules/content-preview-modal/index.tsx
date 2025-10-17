"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/atoms/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/atoms/tabs";
import { Textarea } from "@/components/atoms/textarea";
import { Button } from "@/components/atoms/button";
import {
  Copy,
  Check,
  FileText,
  Mail,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  FileCheck,
} from "lucide-react";
import { ContentKitStatus } from "@/services/content-kit";
import SocialPostButton from "@/components/molecules/social-post-button";

interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentKit: ContentKitStatus | null;
  onSave?: (updatedOutputs: ContentKitStatus["outputs"]) => void;
}

export default function ContentPreviewModal({
  isOpen,
  onClose,
  contentKit,
  onSave,
}: ContentPreviewModalProps) {
  const [editedOutputs, setEditedOutputs] = useState<
    ContentKitStatus["outputs"]
  >({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("blogPost");

  // Initialize edited outputs when content kit changes
  useEffect(() => {
    if (contentKit?.outputs) {
      setEditedOutputs({ ...contentKit.outputs });

      // Set the first available content as active tab
      const availableContent = Object.keys(contentKit.outputs).find(
        (key) => contentKit.outputs[key as keyof typeof contentKit.outputs]
      );
      if (availableContent) {
        setActiveTab(availableContent);
      }
    }
  }, [contentKit]);

  const handleCopy = async (field: string, content: string | string[]) => {
    const textToCopy = Array.isArray(content) ? content.join("\n\n") : content;
    await navigator.clipboard.writeText(textToCopy);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedOutputs);
    }
    onClose();
  };

  const updateField = (
    field: keyof ContentKitStatus["outputs"],
    value: string
  ) => {
    setEditedOutputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateArrayField = (
    field: keyof ContentKitStatus["outputs"],
    index: number,
    value: string
  ) => {
    setEditedOutputs((prev) => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = [...currentArray];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  const getCharCount = (content: string | string[] | undefined): number => {
    if (!content) return 0;
    if (Array.isArray(content)) {
      return content.join("").length;
    }
    return content.length;
  };

  const contentTypes = [
    {
      key: "blogPost",
      label: "Blog Post",
      icon: FileText,
      description: "Long-form article",
    },
    {
      key: "linkedInPost",
      label: "LinkedIn",
      icon: Linkedin,
      description: "Professional post",
    },
    {
      key: "tweets",
      label: "Tweet Thread",
      icon: Twitter,
      description: "5-10 tweets",
    },
    {
      key: "instagramCarousel",
      label: "Instagram",
      icon: Instagram,
      description: "Carousel slides",
    },
    {
      key: "facebookPost",
      label: "Facebook",
      icon: Facebook,
      description: "Facebook post",
    },
    {
      key: "youtubeScript",
      label: "YouTube",
      icon: Youtube,
      description: "Video script",
    },
    {
      key: "newsletter",
      label: "Newsletter",
      icon: Mail,
      description: "Email newsletter",
    },
    {
      key: "transcript",
      label: "Transcript",
      icon: FileCheck,
      description: "Original transcript",
    },
  ];

  if (!contentKit) return null;

  const availableContent = contentTypes.filter(
    (type) => editedOutputs[type.key as keyof typeof editedOutputs]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-['Satoshi'] text-2xl font-bold text-zinc-900">
            Content Preview & Editor
          </DialogTitle>
          <DialogDescription className="font-['Satoshi'] text-stone-600">
            Review, edit, and copy your generated content
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList
            className="grid w-full bg-stone-100 p-1 rounded-lg mb-4"
            style={{
              gridTemplateColumns: `repeat(${Math.min(availableContent.length, 4)}, 1fr)`,
            }}
          >
            {availableContent.map((type) => {
              const Icon = type.icon;
              return (
                <TabsTrigger
                  key={type.key}
                  value={type.key}
                  className="flex items-center gap-2 font-['Satoshi'] data-[state=active]:bg-white data-[state=active]:text-[#3a8e9c]"
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{type.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2">
            {availableContent.map((type) => {
              const content =
                editedOutputs[type.key as keyof typeof editedOutputs];
              const isArray = Array.isArray(content);

              return (
                <TabsContent key={type.key} value={type.key} className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold font-['Satoshi'] text-zinc-900">
                          {type.label}
                        </h3>
                        <p className="text-sm text-stone-600 font-['Satoshi']">
                          {type.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() =>
                            handleCopy(type.key, content as string | string[])
                          }
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {copiedField === type.key ? (
                            <>
                              <Check size={16} className="text-green-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              Copy
                            </>
                          )}
                        </Button>
                        <SocialPostButton
                          contentType={
                            type.key as
                              | "tweet"
                              | "linkedin"
                              | "facebook"
                              | "blog"
                              | "instagram"
                              | "newsletter"
                          }
                          content={content as string | string[]}
                          disabled={
                            !content ||
                            (Array.isArray(content) && content.length === 0)
                          }
                        />
                      </div>
                    </div>

                    {isArray ? (
                      // Handle array content (tweets, instagram carousel)
                      <div className="space-y-3">
                        {(content as string[]).map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-stone-700 font-['Satoshi']">
                                {type.key === "tweets"
                                  ? `Tweet ${index + 1}/${(content as string[]).length}`
                                  : `Slide ${index + 1}`}
                              </label>
                              <span className="text-xs text-stone-500 font-['Satoshi']">
                                {item.length} characters
                              </span>
                            </div>
                            <Textarea
                              value={item}
                              onChange={(e) =>
                                updateArrayField(
                                  type.key as keyof ContentKitStatus["outputs"],
                                  index,
                                  e.target.value
                                )
                              }
                              className="min-h-[100px] font-['Satoshi'] text-sm"
                              placeholder={`Enter ${type.label.toLowerCase()} content...`}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Handle string content
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-stone-700 font-['Satoshi']">
                            Content
                          </label>
                          <span className="text-xs text-stone-500 font-['Satoshi']">
                            {getCharCount(content)} characters
                          </span>
                        </div>
                        <Textarea
                          value={(content as string) || ""}
                          onChange={(e) =>
                            updateField(
                              type.key as keyof ContentKitStatus["outputs"],
                              e.target.value
                            )
                          }
                          className="min-h-[400px] font-['Satoshi'] text-sm"
                          placeholder={`Enter ${type.label.toLowerCase()} content...`}
                        />
                      </div>
                    )}

                    {/* Character count warning for specific formats */}
                    {type.key === "tweets" &&
                      (content as string[]).some(
                        (tweet) => tweet.length > 280
                      ) && (
                        <div className="text-xs text-orange-600 font-['Satoshi'] bg-orange-50 p-2 rounded">
                          ⚠️ One or more tweets exceed 280 characters
                        </div>
                      )}
                  </div>
                </TabsContent>
              );
            })}
          </div>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <p className="text-sm text-stone-600 font-['Satoshi']">
            {availableContent.length} content piece
            {availableContent.length !== 1 ? "s" : ""} generated
          </p>
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="font-['Satoshi']"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-['Satoshi']"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
