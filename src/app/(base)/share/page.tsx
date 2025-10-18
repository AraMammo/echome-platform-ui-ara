"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import { Textarea } from "@/components/atoms/textarea";
import { Copy, Check, Facebook, Linkedin, Twitter } from "lucide-react";
import { showcaseService, ShareCard } from "@/services/showcase";
import { useAuthStore } from "@/stores/auth-store";

type CardTemplate = "metrics" | "before-after" | "testimonial";

export default function SharePage() {
  const { user } = useAuthStore();
  const [selectedTemplate, setSelectedTemplate] =
    useState<CardTemplate>("metrics");
  const [testimonial, setTestimonial] = useState(
    "Echo Me has transformed how I create content. My AI truly sounds like me!"
  );
  const [includeStats, setIncludeStats] = useState(true);
  const [includeExample, setIncludeExample] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareCard, setShareCard] = useState<ShareCard | null>(null);
  const [copied, setCopied] = useState(false);
  const [userCards, setUserCards] = useState<ShareCard[]>([]);

  useEffect(() => {
    loadUserCards();
  }, []);

  const loadUserCards = async () => {
    try {
      const response = await showcaseService.getShareCards();
      if (response.success) {
        setUserCards(response.data);
      }
    } catch (error) {
      console.error("Error loading share cards:", error);
    }
  };

  const handleGenerateCard = async () => {
    setIsGenerating(true);
    try {
      const response = await showcaseService.createShareCard({
        testimonial: includeExample ? testimonial : undefined,
        includeExample: includeExample,
      });

      if (response.success) {
        setShareCard(response.data);
        await loadUserCards();
      }
    } catch (error) {
      console.error("Error generating card:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareCard) return;

    const success = await showcaseService.copyShareUrl(shareCard.shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: "twitter" | "linkedin" | "facebook") => {
    if (!shareCard) return;

    showcaseService.shareToSocial(shareCard.shareUrl, platform);
    showcaseService.recordClick(shareCard.id, platform);
  };

  const renderCardPreview = () => {
    if (!shareCard) return null;

    const { cardData } = shareCard;

    if (selectedTemplate === "metrics") {
      return (
        <div className="rounded-[20px] border-2 border-[#3a8e9c] bg-gradient-to-br from-[#3a8e9c]/10 to-[#9b8baf]/10 p-8">
          <div className="mb-6 text-center">
            <h3 className="mb-2 text-2xl font-medium text-[#1c1c1e]">
              My Echo Me Voice
            </h3>
            <p className="text-[#9b8baf]">AI that truly sounds like me</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-[10px] bg-white p-4 text-center">
              <p className="text-3xl font-medium text-[#3a8e9c]">
                {cardData.fileCount}
              </p>
              <p className="text-sm text-[#9b8baf]">Files Trained</p>
            </div>
            <div className="rounded-[10px] bg-white p-4 text-center">
              <p className="text-3xl font-medium text-[#3a8e9c]">
                {cardData.voiceAccuracy}%
              </p>
              <p className="text-sm text-[#9b8baf]">Voice Accuracy</p>
            </div>
          </div>

          {includeStats && (
            <div className="mb-6 rounded-[10px] bg-white p-4">
              <p className="mb-2 text-sm font-medium text-[#1c1c1e]">
                Content Types:
              </p>
              <div className="flex flex-wrap gap-2">
                {cardData.contentTypes.map((type, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-[#3a8e9c]/10 px-3 py-1 text-xs text-[#3a8e9c]"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {cardData.testimonial && (
            <div className="rounded-[10px] bg-white p-4">
              <p className="text-sm italic text-[#1c1c1e]">
                &quot;{cardData.testimonial}&quot;
              </p>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-[#9b8baf]">
            echome.ai • Train your AI voice
          </div>
        </div>
      );
    }

    if (selectedTemplate === "before-after") {
      return (
        <div className="rounded-[20px] border-2 border-[#9b8baf] bg-white p-8">
          <div className="mb-6 text-center">
            <h3 className="mb-2 text-2xl font-medium text-[#1c1c1e]">
              Generic AI vs My Voice
            </h3>
            <p className="text-[#9b8baf]">See the difference</p>
          </div>

          <div className="mb-4 rounded-[10px] border border-[#d5d2cc] bg-[#f3f1ec] p-4">
            <p className="mb-2 text-xs font-medium text-[#9b8baf]">
              GENERIC AI
            </p>
            <p className="text-sm text-[#1c1c1e]">
              Thank you for your interest. I appreciate your consideration and
              will review this matter carefully...
            </p>
          </div>

          <div className="mb-4 text-center text-xs text-[#9b8baf]">↓</div>

          <div className="rounded-[10px] border-2 border-[#3a8e9c] bg-gradient-to-br from-[#3a8e9c]/5 to-white p-4">
            <p className="mb-2 text-xs font-medium text-[#3a8e9c]">
              MY ECHO ME VOICE
            </p>
            <p className="text-sm text-[#1c1c1e]">
              {cardData.exampleOutput ||
                "Hey! Thanks for thinking of me. I'd love to help but I'm swamped right now. Let's circle back soon?"}
            </p>
          </div>

          <div className="mt-6 rounded-[10px] bg-[#3a8e9c]/10 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#1c1c1e]">Voice Accuracy</span>
              <span className="font-medium text-[#3a8e9c]">
                {cardData.voiceAccuracy}%
              </span>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-[#9b8baf]">
            echome.ai • Train your AI voice
          </div>
        </div>
      );
    }

    if (selectedTemplate === "testimonial") {
      return (
        <div className="rounded-[20px] border-2 border-[#b4a398] bg-gradient-to-br from-[#b4a398]/10 to-white p-8">
          <div className="mb-6">
            <div className="mb-4 text-center text-4xl">✨</div>
            <p className="mb-4 text-center text-lg italic text-[#1c1c1e]">
              &quot;{cardData.testimonial || testimonial}&quot;
            </p>
            <p className="text-center text-sm text-[#9b8baf]">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username || "Echo Me User"}
            </p>
          </div>

          {includeStats && (
            <div className="mb-6 grid grid-cols-3 gap-3 border-t border-[#d5d2cc] pt-6">
              <div className="text-center">
                <p className="text-xl font-medium text-[#b4a398]">
                  {cardData.fileCount}
                </p>
                <p className="text-xs text-[#9b8baf]">Files</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-medium text-[#b4a398]">
                  {cardData.voiceAccuracy}%
                </p>
                <p className="text-xs text-[#9b8baf]">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-medium text-[#b4a398]">
                  {cardData.contentTypes.length}
                </p>
                <p className="text-xs text-[#9b8baf]">Types</p>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-[#9b8baf]">
            echome.ai • Train your AI voice
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-medium text-[#1c1c1e]">
            Share Your Voice
          </h1>
          <p className="text-lg text-[#9b8baf]">
            Create shareable cards to showcase your Echo Me results
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column - Customization */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="rounded-[20px] border border-[#d5d2cc] bg-white p-6">
              <h2 className="mb-4 text-lg font-medium text-[#1c1c1e]">
                Choose Template
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedTemplate("metrics")}
                  className={`rounded-[10px] border-2 p-4 text-center transition-all ${
                    selectedTemplate === "metrics"
                      ? "border-[#3a8e9c] bg-[#3a8e9c]/10"
                      : "border-[#d5d2cc] hover:border-[#3a8e9c]/50"
                  }`}
                >
                  <div className="mb-2 text-2xl">📊</div>
                  <p className="text-xs font-medium text-[#1c1c1e]">Metrics</p>
                </button>
                <button
                  onClick={() => setSelectedTemplate("before-after")}
                  className={`rounded-[10px] border-2 p-4 text-center transition-all ${
                    selectedTemplate === "before-after"
                      ? "border-[#9b8baf] bg-[#9b8baf]/10"
                      : "border-[#d5d2cc] hover:border-[#9b8baf]/50"
                  }`}
                >
                  <div className="mb-2 text-2xl">⚡</div>
                  <p className="text-xs font-medium text-[#1c1c1e]">
                    Before/After
                  </p>
                </button>
                <button
                  onClick={() => setSelectedTemplate("testimonial")}
                  className={`rounded-[10px] border-2 p-4 text-center transition-all ${
                    selectedTemplate === "testimonial"
                      ? "border-[#b4a398] bg-[#b4a398]/10"
                      : "border-[#d5d2cc] hover:border-[#b4a398]/50"
                  }`}
                >
                  <div className="mb-2 text-2xl">💬</div>
                  <p className="text-xs font-medium text-[#1c1c1e]">
                    Testimonial
                  </p>
                </button>
              </div>
            </div>

            {/* Customization Options */}
            <div className="rounded-[20px] border border-[#d5d2cc] bg-white p-6">
              <h2 className="mb-4 text-lg font-medium text-[#1c1c1e]">
                Customize Card
              </h2>

              {/* Testimonial Input */}
              {(selectedTemplate === "testimonial" ||
                selectedTemplate === "metrics") && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-[#1c1c1e]">
                    Your Testimonial
                  </label>
                  <Textarea
                    value={testimonial}
                    onChange={(e) => setTestimonial(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-[10px] border-[#d5d2cc] bg-[#f3f1ec] px-4 py-3 text-sm text-[#1c1c1e]"
                    placeholder="Share your experience with Echo Me..."
                  />
                </div>
              )}

              {/* Toggle Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeStats}
                    onChange={(e) => setIncludeStats(e.target.checked)}
                    className="h-4 w-4 rounded border-[#d5d2cc] text-[#3a8e9c]"
                  />
                  <span className="text-sm text-[#1c1c1e]">
                    Include statistics
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeExample}
                    onChange={(e) => setIncludeExample(e.target.checked)}
                    className="h-4 w-4 rounded border-[#d5d2cc] text-[#3a8e9c]"
                  />
                  <span className="text-sm text-[#1c1c1e]">
                    Include example output
                  </span>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateCard}
              disabled={isGenerating}
              className="w-full bg-[#3a8e9c] py-6 text-lg hover:bg-[#2d7a85]"
            >
              {isGenerating ? "Generating..." : "Generate Share Card"}
            </Button>
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="rounded-[20px] border border-[#d5d2cc] bg-[#f3f1ec] p-6">
              <h2 className="mb-4 text-lg font-medium text-[#1c1c1e]">
                Preview
              </h2>
              {shareCard ? (
                <div>{renderCardPreview()}</div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#d5d2cc] py-16">
                  <div className="mb-2 text-4xl">🎨</div>
                  <p className="text-sm text-[#9b8baf]">
                    Generate a card to see preview
                  </p>
                </div>
              )}
            </div>

            {/* Share Actions */}
            {shareCard && (
              <div className="rounded-[20px] border border-[#d5d2cc] bg-white p-6">
                <h2 className="mb-4 text-lg font-medium text-[#1c1c1e]">
                  Share Your Card
                </h2>

                {/* Share URL */}
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={shareCard.shareUrl}
                    readOnly
                    className="flex-1 rounded-[10px] border border-[#d5d2cc] bg-[#f3f1ec] px-4 py-2 text-sm text-[#9b8baf]"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="border-[#3a8e9c] text-[#3a8e9c]"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Social Share Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleShare("twitter")}
                    variant="outline"
                    className="border-[#1DA1F2] text-[#1DA1F2] hover:bg-[#1DA1F2]/10"
                  >
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    onClick={() => handleShare("linkedin")}
                    variant="outline"
                    className="border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/10"
                  >
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button
                    onClick={() => handleShare("facebook")}
                    variant="outline"
                    className="border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2]/10"
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#d5d2cc] pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-medium text-[#3a8e9c]">
                      {shareCard.views}
                    </p>
                    <p className="text-xs text-[#9b8baf]">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-medium text-[#9b8baf]">
                      {shareCard.clicks}
                    </p>
                    <p className="text-xs text-[#9b8baf]">Clicks</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Previous Cards */}
        {userCards.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-medium text-[#1c1c1e]">
              Your Previous Cards
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {userCards.slice(0, 6).map((card) => (
                <div
                  key={card.id}
                  className="rounded-[20px] border border-[#d5d2cc] bg-white p-4 transition-all hover:border-[#3a8e9c]"
                >
                  <div className="mb-3 text-xs text-[#9b8baf]">
                    {new Date(card.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mb-3 flex gap-4 text-sm">
                    <div>
                      <span className="font-medium text-[#1c1c1e]">
                        {card.views}
                      </span>
                      <span className="text-[#9b8baf]"> views</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#1c1c1e]">
                        {card.clicks}
                      </span>
                      <span className="text-[#9b8baf]"> clicks</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShareCard(card)}
                    variant="outline"
                    size="sm"
                    className="w-full border-[#3a8e9c] text-[#3a8e9c]"
                  >
                    View Card
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
