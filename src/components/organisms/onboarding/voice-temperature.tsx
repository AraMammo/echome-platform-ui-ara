"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, WifiOff, Wifi } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/utils/cn";
import { useOnboardingStatus, EchoLevel } from "@/hooks/use-onboarding-status";
import { DemoGenerator } from "./demo-generator";

interface SignalMeterProps {
  fileCount: number;
  signalBars: number;
  percentComplete: number;
}

function SignalMeter({
  fileCount,
  signalBars,
  percentComplete,
}: SignalMeterProps) {
  const milestones = [
    { label: "Silent", files: 0, bars: 0 },
    { label: "Faint", files: 10, bars: 2 },
    { label: "Clear", files: 25, bars: 3 },
    { label: "Strong", files: 50, bars: 4 },
    { label: "Crystal", files: 100, bars: 5 },
  ];

  return (
    <div className="relative">
      {/* Milestone markers */}
      <div className="flex justify-between mb-4">
        {milestones.map((m) => (
          <div key={m.files} className="text-center flex-1">
            <div className="flex justify-center mb-2">
              <SignalBars bars={m.bars} active={fileCount >= m.files} />
            </div>
            <div className="text-xs text-[#9b8baf] font-medium">{m.files}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-[#d5d2cc] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#3a8e9c] to-[#9b8baf] transition-all duration-500"
          style={{ width: `${Math.min(percentComplete, 100)}%` }}
          role="progressbar"
          aria-valuenow={percentComplete}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Upload progress: ${fileCount} files`}
        />
      </div>
    </div>
  );
}

interface SignalBarsProps {
  bars: number;
  active?: boolean;
}

function SignalBars({ bars, active = true }: SignalBarsProps) {
  const totalBars = 5;
  const barHeights = [20, 40, 60, 80, 100];

  if (bars === 0) {
    return (
      <WifiOff
        size={32}
        className={cn(
          "transition-colors",
          active ? "text-[#9b8baf]" : "text-[#d5d2cc]"
        )}
      />
    );
  }

  return (
    <div className="flex items-end gap-0.5 h-8">
      {Array.from({ length: totalBars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 rounded-sm transition-all duration-300",
            i < bars
              ? active
                ? "bg-[#3a8e9c]"
                : "bg-[#d5d2cc]"
              : "bg-[#d5d2cc]"
          )}
          style={{ height: `${barHeights[i]}%` }}
        />
      ))}
    </div>
  );
}

interface UnlockLevelProps {
  bars: number;
  files: string;
  benefit: string;
  unlocked: boolean;
}

function UnlockLevel({ bars, files, benefit, unlocked }: UnlockLevelProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all",
        unlocked ? "bg-white border border-[#3a8e9c]" : "opacity-60"
      )}
    >
      <div className="w-10 flex justify-center" aria-hidden="true">
        <SignalBars bars={bars} active={unlocked} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#1c1c1e]">{files}</span>
          {unlocked && (
            <Check size={16} className="text-[#3a8e9c]" aria-label="Unlocked" />
          )}
        </div>
        <p className="text-sm text-[#9b8baf]">{benefit}</p>
      </div>
    </div>
  );
}

function getEchoLabel(level: EchoLevel): string {
  const labels: Record<EchoLevel, string> = {
    silent: "SILENT",
    faint: "FAINT ECHO",
    clear: "CLEAR ECHO",
    strong: "STRONG ECHO",
    crystal: "CRYSTAL ECHO",
  };
  return labels[level] || "SILENT";
}

export function VoiceTemperatureOnboarding() {
  const { fileCount, echoLevel, signalBars, percentComplete } =
    useOnboardingStatus();
  const [showDemo, setShowDemo] = useState(false);
  const router = useRouter();

  const handleSkipSetup = () => {
    // Store skip preference in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("echome_onboarding_skipped", "true");
    }
    router.push("/?skip-onboarding=true");
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f9f8f6]">
        <div className="max-w-2xl w-full">
          {/* Signal Icon & Status */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4" aria-hidden="true">
              <div className="scale-[2.5]">
                <SignalBars bars={signalBars} />
              </div>
            </div>
            <h1 className="text-4xl font-medium text-[#1c1c1e] mb-2">
              Your Echo Signal: {getEchoLabel(echoLevel)}
            </h1>
            <p className="text-lg text-[#9b8baf]">
              Echo Me hasn&apos;t learned your voice yet. Upload content to
              strengthen your signal.
            </p>
          </div>

          {/* Signal Progress Bar */}
          <div className="mb-8">
            <SignalMeter
              fileCount={fileCount}
              signalBars={signalBars}
              percentComplete={percentComplete}
            />
            <p className="text-center text-sm text-[#9b8baf] mt-2">
              Current: {fileCount} files uploaded
            </p>
          </div>

          {/* Primary CTAs */}
          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-lg font-medium text-[#1c1c1e] mb-4">
                Fastest Way to Get Started:
              </h3>

              {/* Gmail Import Card */}
              <div className="p-6 border-2 border-[#3a8e9c] rounded-lg bg-[#3a8e9c]/5 mb-4">
                <div className="flex items-start gap-4">
                  <div className="text-4xl" aria-hidden="true">
                    📧
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#1c1c1e] mb-2">
                      Import Gmail Sent Folder
                    </h4>
                    <ul className="text-sm text-[#9b8baf] space-y-1 mb-4">
                      <li>→ Adds 200+ examples in 2 minutes</li>
                      <li>→ Shows Echo Me your real writing style</li>
                      <li>→ Fastest path to quality content</li>
                    </ul>
                    <Button
                      onClick={() =>
                        router.push("/knowledge-base?action=gmail")
                      }
                      className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white w-full"
                    >
                      Import Gmail →
                    </Button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[#d5d2cc]"></div>
                <span className="text-sm text-[#9b8baf]">or</span>
                <div className="flex-1 h-px bg-[#d5d2cc]"></div>
              </div>

              {/* Manual Upload Card */}
              <div className="p-6 border border-[#d5d2cc] rounded-lg bg-white">
                <div className="flex items-start gap-4">
                  <div className="text-4xl" aria-hidden="true">
                    📁
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#1c1c1e] mb-2">
                      Upload Files Manually
                    </h4>
                    <ul className="text-sm text-[#9b8baf] space-y-1 mb-4">
                      <li>→ Add your best emails, articles, videos</li>
                      <li>→ Full control over what you share</li>
                      <li>→ Build your knowledge base your way</li>
                    </ul>
                    <Button
                      onClick={() => router.push("/knowledge-base")}
                      variant="outline"
                      className="w-full border-[#3a8e9c] text-[#3a8e9c] hover:bg-[#3a8e9c]/10"
                    >
                      Upload Files →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What You'll Unlock */}
          <div className="mb-8 p-6 bg-[#f3f1ec] rounded-lg">
            <h3 className="font-medium text-[#1c1c1e] mb-4">
              What You&apos;ll Unlock:
            </h3>
            <div className="space-y-3">
              <UnlockLevel
                bars={2}
                files="10 files"
                benefit="Basic content generation"
                unlocked={fileCount >= 10}
              />
              <UnlockLevel
                bars={3}
                files="25 files"
                benefit="Your voice starts showing"
                unlocked={fileCount >= 25}
              />
              <UnlockLevel
                bars={4}
                files="50 files"
                benefit="Content sounds like you"
                unlocked={fileCount >= 50}
              />
              <UnlockLevel
                bars={5}
                files="100 files"
                benefit="Indistinguishable from you"
                unlocked={fileCount >= 100}
              />
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setShowDemo(true)}
              className="text-sm text-[#3a8e9c] hover:underline focus:outline-none focus:ring-2 focus:ring-[#3a8e9c] focus:ring-offset-2 rounded px-2 py-1"
            >
              See Demo
            </button>
            <span className="text-[#d5d2cc]" aria-hidden="true">
              •
            </span>
            <button
              onClick={handleSkipSetup}
              className="text-sm text-[#9b8baf] hover:text-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#9b8baf] focus:ring-offset-2 rounded px-2 py-1"
            >
              Skip Setup
            </button>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemo && <DemoGenerator onClose={() => setShowDemo(false)} />}
    </>
  );
}
