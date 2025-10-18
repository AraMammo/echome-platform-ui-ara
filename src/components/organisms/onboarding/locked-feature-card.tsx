"use client";

import React from "react";
import { Lock, Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface LockedFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  requiredFiles: number;
  currentFiles: number;
  onUnlock?: () => void;
}

export function LockedFeatureCard({
  title,
  description,
  icon,
  requiredFiles,
  currentFiles,
  onUnlock,
}: LockedFeatureCardProps) {
  const isLocked = currentFiles < requiredFiles;
  const filesNeeded = requiredFiles - currentFiles;
  const progress = Math.min((currentFiles / requiredFiles) * 100, 100);

  return (
    <div
      className={cn(
        "p-6 rounded-[20px] border transition-all relative",
        isLocked
          ? "border-[#d5d2cc] bg-[#f3f1ec] opacity-75"
          : "border-[#3a8e9c] bg-white hover:shadow-lg cursor-pointer"
      )}
      onClick={!isLocked && onUnlock ? onUnlock : undefined}
      role={!isLocked && onUnlock ? "button" : undefined}
      tabIndex={!isLocked && onUnlock ? 0 : undefined}
      onKeyDown={
        !isLocked && onUnlock
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onUnlock();
              }
            }
          : undefined
      }
      aria-label={
        isLocked
          ? `${title} - Locked. Upload ${filesNeeded} more files to unlock.`
          : `${title} - Unlocked. Click to access.`
      }
    >
      {/* Lock icon overlay */}
      {isLocked && (
        <div className="absolute top-4 right-4">
          <Lock size={20} className="text-[#9b8baf]" aria-hidden="true" />
        </div>
      )}

      {/* Feature icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-[12px] flex items-center justify-center mb-4",
          isLocked ? "bg-[#d5d2cc]" : "bg-[#3a8e9c]/10"
        )}
      >
        <div
          className={cn("text-2xl", isLocked && "grayscale opacity-50")}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      {/* Title & description */}
      <h3
        className={cn(
          "font-medium mb-2",
          isLocked ? "text-[#9b8baf]" : "text-[#1c1c1e]"
        )}
      >
        {title}
      </h3>
      <p className="text-sm text-[#9b8baf] mb-4">{description}</p>

      {/* Lock status */}
      {isLocked ? (
        <div>
          <div className="flex items-center justify-between text-xs text-[#9b8baf] mb-2">
            <span>Upload {filesNeeded} more files to unlock</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-[#d5d2cc] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#9b8baf] transition-all duration-500"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress to unlock: ${Math.round(progress)}%`}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-[#3a8e9c]">
          <Check size={16} />
          <span>Unlocked</span>
        </div>
      )}
    </div>
  );
}
