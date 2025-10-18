"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/utils/cn";

interface SmartBannerProps {
  recommendation: {
    title: string;
    message: string;
    cta: string;
    action: string;
    priority: "high" | "medium" | "low";
  };
  onDismiss: () => void;
  onAction: () => void;
}

export function SmartBanner({
  recommendation,
  onDismiss,
  onAction,
}: SmartBannerProps) {
  const { priority, title, message, cta } = recommendation;

  const colorClasses = {
    high: "bg-[#3a8e9c]/10 border-[#3a8e9c]",
    medium: "bg-[#9b8baf]/10 border-[#9b8baf]",
    low: "bg-[#b4a398]/10 border-[#b4a398]",
  };

  const iconClasses = {
    high: "text-[#3a8e9c]",
    medium: "text-[#9b8baf]",
    low: "text-[#b4a398]",
  };

  const buttonClasses = {
    high: "bg-[#3a8e9c] hover:bg-[#2d7a85]",
    medium: "bg-[#9b8baf] hover:bg-[#8a7a9e]",
    low: "bg-[#b4a398] hover:bg-[#a39387]",
  };

  return (
    <div
      className={cn(
        "p-6 rounded-[20px] border-2 transition-all hover:shadow-md animate-in slide-in-from-top-4 duration-300",
        colorClasses[priority]
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn("text-4xl", iconClasses[priority])}
          aria-hidden="true"
        >
          {priority === "high" ? "💡" : priority === "medium" ? "✨" : "🎯"}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-medium text-[#1c1c1e] mb-2">{title}</h3>
          <p className="text-sm text-[#9b8baf] mb-4">{message}</p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={onAction}
              size="sm"
              className={cn("text-white", buttonClasses[priority])}
            >
              {cta}
            </Button>
            <button
              onClick={onDismiss}
              className="text-sm text-[#9b8baf] hover:text-[#1c1c1e] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3a8e9c] focus:ring-offset-2 rounded px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          className="text-[#9b8baf] hover:text-[#1c1c1e] transition-colors p-2 rounded-lg hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#3a8e9c] focus:ring-offset-2"
          aria-label="Dismiss recommendation"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
