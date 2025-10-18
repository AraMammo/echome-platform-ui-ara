"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";

interface NextStepCardProps {
  fileCount: number;
  temperatureLevel: string;
}

export function NextStepCard({ fileCount }: NextStepCardProps) {
  const router = useRouter();

  const getNextStep = () => {
    if (fileCount === 0) {
      return {
        emoji: "🚀",
        title: "Upload Your First File",
        description:
          "Start by uploading 3-5 of your best-performing emails or articles",
        cta: "Upload Files",
        action: () => router.push("/knowledge-base"),
      };
    } else if (fileCount < 10) {
      return {
        emoji: "📧",
        title: "Import Your Gmail Sent Folder",
        description: `Add ${10 - fileCount} more files quickly by importing your Gmail`,
        cta: "Import Gmail",
        action: () => router.push("/knowledge-base?action=gmail"),
      };
    } else if (fileCount < 25) {
      return {
        emoji: "🎯",
        title: "Build Momentum",
        description: `Upload ${25 - fileCount} more files to unlock advanced features`,
        cta: "Upload More",
        action: () => router.push("/knowledge-base"),
      };
    } else if (fileCount < 50) {
      return {
        emoji: "🎥",
        title: "Add Video Content",
        description:
          "Connect YouTube or upload videos to capture your speaking style",
        cta: "Connect YouTube",
        action: () => router.push("/knowledge-base"),
      };
    } else if (fileCount < 100) {
      return {
        emoji: "🔥",
        title: "Push to Excellence",
        description: `Just ${100 - fileCount} more files until maximum quality`,
        cta: "Keep Uploading",
        action: () => router.push("/knowledge-base"),
      };
    } else {
      return {
        emoji: "✨",
        title: "Start Creating",
        description: "Your AI is fully trained. Generate amazing content now!",
        cta: "Generate Content",
        action: () => router.push("/create"),
      };
    }
  };

  const nextStep = getNextStep();

  return (
    <div className="p-6 bg-gradient-to-r from-[#3a8e9c]/10 to-[#9b8baf]/10 rounded-[20px] border border-[#d5d2cc]">
      <div className="flex items-start gap-4">
        <div className="text-5xl" aria-hidden="true">
          {nextStep.emoji}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-[#1c1c1e] mb-2">What&apos;s Next?</h3>
          <p className="text-lg font-medium text-[#1c1c1e] mb-2">
            {nextStep.title}
          </p>
          <p className="text-sm text-[#9b8baf] mb-4">{nextStep.description}</p>
          <Button
            onClick={nextStep.action}
            className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white"
          >
            {nextStep.cta} →
          </Button>
        </div>
      </div>
    </div>
  );
}
