"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { LockedFeatureCard } from "./locked-feature-card";

interface ProgressDashboardProps {
  fileCount: number;
}

export function ProgressDashboard({ fileCount }: ProgressDashboardProps) {
  const router = useRouter();
  const filesNeeded = 10 - fileCount;
  const progressPercent = (fileCount / 10) * 100;

  return (
    <div className="min-h-screen px-6 py-8 bg-[#f9f8f6]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Progress Banner */}
        <div className="bg-gradient-to-r from-[#3a8e9c]/10 to-[#9b8baf]/10 rounded-[20px] p-8 border border-[#d5d2cc]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-medium text-[#1c1c1e] mb-2">
                You&apos;re {filesNeeded} Files Away from Full Access
              </h1>
              <p className="text-lg text-[#9b8baf]">
                Upload {filesNeeded} more files to unlock all features and
                better content quality.
              </p>
            </div>
            <div className="text-6xl" aria-hidden="true">
              {fileCount < 5 ? "🧊" : "❄️"}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-[#9b8baf] mb-2">
              <span>{fileCount} files uploaded</span>
              <span>Goal: 10 files</span>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3a8e9c] to-[#9b8baf] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Upload progress: ${fileCount} of 10 files`}
              />
            </div>
          </div>

          <Button
            onClick={() => router.push("/knowledge-base")}
            className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white"
          >
            Upload More Files →
          </Button>
        </div>

        {/* Feature Cards */}
        <div>
          <h2 className="text-xl font-medium text-[#1c1c1e] mb-4">
            What You&apos;ll Unlock
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LockedFeatureCard
              title="Generate Content"
              description="Create Instagram posts, blogs, emails and more"
              icon="✨"
              requiredFiles={10}
              currentFiles={fileCount}
              onUnlock={() => router.push("/create")}
            />

            <LockedFeatureCard
              title="Content Library"
              description="Access and manage all your generated content"
              icon="📚"
              requiredFiles={10}
              currentFiles={fileCount}
              onUnlock={() => router.push("/library")}
            />

            <LockedFeatureCard
              title="Advanced Presets"
              description="Save audience + format combinations for quick generation"
              icon="⚡"
              requiredFiles={25}
              currentFiles={fileCount}
            />

            <LockedFeatureCard
              title="Schedule Posts"
              description="Plan and automate your content calendar"
              icon="📅"
              requiredFiles={25}
              currentFiles={fileCount}
            />

            <LockedFeatureCard
              title="Quality Boost"
              description="Higher quality content that matches your voice"
              icon="🎯"
              requiredFiles={50}
              currentFiles={fileCount}
            />

            <LockedFeatureCard
              title="Expert Mode"
              description="Full control over tone, style, and formatting"
              icon="🏆"
              requiredFiles={100}
              currentFiles={fileCount}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <h2 className="text-xl font-medium text-[#1c1c1e] mb-4">
            Your Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-white border border-[#d5d2cc] rounded-[20px]">
              <div className="text-3xl mb-2" aria-hidden="true">
                📄
              </div>
              <div className="text-2xl font-medium text-[#1c1c1e]">
                {fileCount}
              </div>
              <div className="text-sm text-[#9b8baf]">Files Uploaded</div>
            </div>

            <div className="p-6 bg-white border border-[#d5d2cc] rounded-[20px]">
              <div className="text-3xl mb-2" aria-hidden="true">
                🧠
              </div>
              <div className="text-2xl font-medium text-[#1c1c1e]">
                {Math.round((fileCount / 10) * 100)}%
              </div>
              <div className="text-sm text-[#9b8baf]">AI Training Level</div>
            </div>

            <div className="p-6 bg-white border border-[#d5d2cc] rounded-[20px]">
              <div className="text-3xl mb-2" aria-hidden="true">
                ⏱️
              </div>
              <div className="text-2xl font-medium text-[#1c1c1e]">
                ~{filesNeeded * 2}m
              </div>
              <div className="text-sm text-[#9b8baf]">Until Full Access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
