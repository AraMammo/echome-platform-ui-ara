import { useState, useEffect, useCallback } from "react";
import { knowledgeBaseService } from "@/services/knowledge-base";

export type TemperatureLevel = "frozen" | "cold" | "cool" | "hot" | "lava";

export interface OnboardingStatus {
  needsOnboarding: boolean;
  fileCount: number;
  temperatureLevel: TemperatureLevel;
  percentComplete: number;
  nextMilestone: number;
  filesUntilNext: number;
  isLoading: boolean;
  error: string | null;
}

const ONBOARDING_THRESHOLD = 10;
const MILESTONES = [10, 25, 50, 100];

function getTemperatureLevel(fileCount: number): TemperatureLevel {
  if (fileCount >= 100) return "lava";
  if (fileCount >= 50) return "hot";
  if (fileCount >= 25) return "cool";
  if (fileCount >= 10) return "cold";
  return "frozen";
}

function getNextMilestone(fileCount: number): number {
  for (const milestone of MILESTONES) {
    if (fileCount < milestone) {
      return milestone;
    }
  }
  return 100; // Max milestone
}

export function useOnboardingStatus(): OnboardingStatus {
  const [fileCount, setFileCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFileCount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch knowledge base content to count total files
      const response = await knowledgeBaseService.getContent({
        limit: 1, // We only need the total count from pagination
        offset: 0,
      });

      const total = response.pagination?.total || 0;
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
  const temperatureLevel = getTemperatureLevel(fileCount);
  const nextMilestone = getNextMilestone(fileCount);
  const filesUntilNext = nextMilestone - fileCount;
  const percentComplete = Math.min((fileCount / 100) * 100, 100);

  return {
    needsOnboarding,
    fileCount,
    temperatureLevel,
    percentComplete,
    nextMilestone,
    filesUntilNext,
    isLoading,
    error,
  };
}
