"use client";

import React from "react";

interface ContentDiversityMeterProps {
  diversity: {
    emails: number;
    documents: number;
    videos: number;
    audio: number;
  };
  missingTypes: string[];
}

export function ContentDiversityMeter({
  diversity,
  missingTypes,
}: ContentDiversityMeterProps) {
  const segments = [
    { label: "Emails", value: diversity.emails, color: "#3a8e9c", emoji: "📧" },
    {
      label: "Documents",
      value: diversity.documents,
      color: "#9b8baf",
      emoji: "📄",
    },
    { label: "Videos", value: diversity.videos, color: "#b4a398", emoji: "🎥" },
    { label: "Audio", value: diversity.audio, color: "#d5d2cc", emoji: "🎵" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-[#1c1c1e]">Content Diversity</h3>
        <span className="text-sm text-[#9b8baf]">
          {missingTypes.length === 0
            ? "Well balanced"
            : `Missing: ${missingTypes.join(", ")}`}
        </span>
      </div>

      {/* Stacked bar chart */}
      <div className="h-8 bg-[#f3f1ec] rounded-full overflow-hidden flex">
        {segments.map(
          (segment, idx) =>
            segment.value > 0 && (
              <div
                key={idx}
                className="flex items-center justify-center text-white text-xs font-medium transition-all hover:opacity-80 cursor-pointer"
                style={{
                  width: `${segment.value}%`,
                  backgroundColor: segment.color,
                }}
                title={`${segment.label}: ${segment.value}%`}
                role="progressbar"
                aria-valuenow={segment.value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${segment.label}: ${segment.value}%`}
              >
                {segment.value > 10 && (
                  <span>
                    {segment.emoji} {segment.value}%
                  </span>
                )}
              </div>
            )
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {segments.map((segment, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
              aria-hidden="true"
            />
            <span className="text-sm text-[#9b8baf]">
              <span aria-hidden="true">{segment.emoji}</span> {segment.label}
            </span>
            <span className="text-sm font-medium text-[#1c1c1e] ml-auto">
              {segment.value}%
            </span>
          </div>
        ))}
      </div>

      {/* Recommendations based on diversity */}
      {missingTypes.length > 0 && (
        <div className="p-3 bg-[#3a8e9c]/10 rounded-lg">
          <p className="text-xs text-[#1c1c1e]">
            💡 Tip: Add {missingTypes.join(" and ")} to give Echo Me a more
            complete picture of your expertise
          </p>
        </div>
      )}
    </div>
  );
}
