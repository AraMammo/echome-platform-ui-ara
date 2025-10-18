import { useState, useEffect, useCallback } from "react";
import { knowledgeBaseService } from "@/services/knowledge-base";

export type EchoLevel = "silent" | "faint" | "clear" | "strong" | "crystal";

export interface OnboardingStatus {
  needsOnboarding: boolean;
  fileCount: number;
  echoLevel: EchoLevel;
  signalBars: number;
  percentComplete: number;
  nextMilestone: number;
  filesUntilNext: number;
  isLoading: boolean;
  error: string | null;
}

const ONBOARDING_THRESHOLD = 10;
const MILESTONES = [10, 25, 50, 100];

function getEchoLevel(fileCount: number): EchoLevel {
  if (fileCount >= 100) return "crystal";
  if (fileCount >= 50) return "strong";
  if (fileCount >= 25) return "clear";
  if (fileCount >= 10) return "faint";
  return "silent";
}

function getSignalBars(fileCount: number): number {
  if (fileCount >= 100) return 5;
  if (fileCount >= 50) return 4;
  if (fileCount >= 25) return 3;
  if (fileCount >= 10) return 2;
  if (fileCount > 0) return 1;
  return 0;
}

function getNextMilestone(fileCount: number): number {
  for (const milestone of MILESTONES) {
    if (fileCount < milestone) {
      return milestone;
    }
  }
  return 100; // Max milestone
}

export interface UseOnboardingStatusReturn extends OnboardingStatus {
  refresh: () => Promise<void>;
}

export function useOnboardingStatus(): UseOnboardingStatusReturn {
  const [fileCount, setFileCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFileCount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch knowledge base content to count total PROCESSED entries
      // Note: This counts processed KB entries, not raw media files
      // Media files (via mediaService) may still be processing
      const response = await knowledgeBaseService.getContent({
        limit: 1, // We only need the total count from pagination
        offset: 0,
      });

      const total = response.pagination?.total || 0;
      console.log(`📊 Knowledge Base count: ${total} processed entries`);
      setFileCount(total);

      // Cache the file count in localStorage to reduce API calls
      if (typeof window !== "undefined") {
        localStorage.setItem("echome_kb_file_count", total.toString());
        localStorage.setItem(
          "echome_kb_file_count_timestamp",
          Date.now().toString()
        );
      }
    } catch (err) {
      console.error("Error fetching knowledge base file count:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch file count"
      );

      // Try to use cached value if available
      if (typeof window !== "undefined") {
        const cachedCount = localStorage.getItem("echome_kb_file_count");
        if (cachedCount) {
          setFileCount(parseInt(cachedCount, 10));
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    // Check cache first
    const cachedCount = localStorage.getItem("echome_kb_file_count");
    const cachedTimestamp = localStorage.getItem(
      "echome_kb_file_count_timestamp"
    );

    // Use cache if it's less than 30 seconds old
    if (cachedCount && cachedTimestamp) {
      const age = Date.now() - parseInt(cachedTimestamp, 10);
      if (age < 30000) {
        setFileCount(parseInt(cachedCount, 10));
        setIsLoading(false);
        return;
      }
    }

    // Otherwise fetch fresh data
    fetchFileCount();
  }, [fetchFileCount]);

  useEffect(() => {
    // Only poll if user still needs onboarding
    if (fileCount >= ONBOARDING_THRESHOLD) {
      return;
    }

    // Poll every 30 seconds for updates
    const pollInterval = setInterval(() => {
      fetchFileCount();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [fileCount, fetchFileCount]);

  const needsOnboarding = fileCount < ONBOARDING_THRESHOLD;
  const echoLevel = getEchoLevel(fileCount);
  const signalBars = getSignalBars(fileCount);
  const nextMilestone = getNextMilestone(fileCount);
  const filesUntilNext = nextMilestone - fileCount;
  const percentComplete = Math.min((fileCount / 100) * 100, 100);

  return {
    needsOnboarding,
    fileCount,
    echoLevel,
    signalBars,
    percentComplete,
    nextMilestone,
    filesUntilNext,
    isLoading,
    error,
    refresh: fetchFileCount, // Allow manual refresh
  };
}
