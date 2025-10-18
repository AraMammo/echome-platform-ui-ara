import { create } from "zustand";
import { useContentAnalysis } from "./use-content-analysis";
import { ContentAnalyzer } from "@/utils/content-analyzer";

interface RecommendationStore {
  dismissedRecommendations: string[];
  dismissRecommendation: (id: string) => void;
  isDismissed: (id: string) => boolean;
  initializeRecommendations: () => void;
}

const STORAGE_KEY = "echome_recommendations_storage";

export const useRecommendationStore = create<RecommendationStore>()(
  (set, get) => ({
    dismissedRecommendations: [],

    initializeRecommendations: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          set({
            dismissedRecommendations: data.dismissedRecommendations || [],
          });
        }
      } catch (error) {
        console.error("Failed to load recommendation data:", error);
      }
    },

    dismissRecommendation: (id) => {
      const currentDismissed = get().dismissedRecommendations;
      if (!currentDismissed.includes(id)) {
        const updatedDismissed = [...currentDismissed, id];
        set({ dismissedRecommendations: updatedDismissed });

        // Persist to localStorage
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ dismissedRecommendations: updatedDismissed })
          );
        } catch (error) {
          console.error("Failed to save recommendation data:", error);
        }
      }
    },

    isDismissed: (id) => {
      return get().dismissedRecommendations.includes(id);
    },
  })
);

export function useRecommendations(fileCount: number) {
  const { analysis } = useContentAnalysis();
  const { isDismissed, dismissRecommendation, initializeRecommendations } =
    useRecommendationStore();

  // Initialize recommendations from localStorage on first use
  React.useEffect(() => {
    initializeRecommendations();
  }, [initializeRecommendations]);

  if (!analysis) {
    return {
      recommendations: [],
      topRecommendation: null,
      dismissRecommendation,
    };
  }

  // Get all recommendations that haven't been dismissed
  const activeRecommendations = analysis.recommendations
    .filter((rec) => !isDismissed(rec))
    .map((rec) => ContentAnalyzer.getRecommendationMessage(rec, { fileCount }))
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  return {
    recommendations: activeRecommendations,
    topRecommendation: activeRecommendations[0] || null,
    dismissRecommendation,
  };
}

// Add React import for useEffect
import * as React from "react";
