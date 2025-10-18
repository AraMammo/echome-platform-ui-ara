import { create } from "zustand";
import {
  ComparisonResult,
  ComparisonOutput,
  voiceComparisonService,
} from "@/services/voice-comparison";

interface ComparisonStore {
  // Current comparison state
  currentComparison: ComparisonResult | null;
  isGenerating: boolean;
  error: string | null;

  // Comparison history
  history: ComparisonResult[];
  isLoadingHistory: boolean;

  // User votes
  votes: Map<string, "up" | "down">; // outputId -> vote

  // Actions
  generateComparison: (prompt: string, versionCount: number) => Promise<void>;
  recordVote: (outputId: string, vote: "up" | "down") => Promise<void>;
  loadHistory: () => Promise<void>;
  clearCurrentComparison: () => void;
  setError: (error: string | null) => void;
}

export const useComparisonStore = create<ComparisonStore>((set, get) => ({
  currentComparison: null,
  isGenerating: false,
  error: null,
  history: [],
  isLoadingHistory: false,
  votes: new Map(),

  generateComparison: async (prompt: string, versionCount: number) => {
    try {
      set({ isGenerating: true, error: null });

      const response = await voiceComparisonService.generateMultipleVersions({
        prompt,
        versionCount,
      });

      if (response.success) {
        set({
          currentComparison: response.data,
          isGenerating: false,
        });

        // Add to history
        const currentHistory = get().history;
        set({
          history: [response.data, ...currentHistory],
        });
      } else {
        set({
          error: "Failed to generate comparison",
          isGenerating: false,
        });
      }
    } catch (error) {
      console.error("Error generating comparison:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate comparison",
        isGenerating: false,
      });
    }
  },

  recordVote: async (outputId: string, vote: "up" | "down") => {
    const currentComparison = get().currentComparison;
    if (!currentComparison) return;

    try {
      // Update local vote immediately
      const newVotes = new Map(get().votes);
      newVotes.set(outputId, vote);
      set({ votes: newVotes });

      // Record vote on backend
      await voiceComparisonService.recordPreference({
        comparisonId: currentComparison.comparisonId,
        outputId,
        vote,
      });
    } catch (error) {
      console.error("Error recording vote:", error);
      // Revert vote on error
      const newVotes = new Map(get().votes);
      newVotes.delete(outputId);
      set({ votes: newVotes });
    }
  },

  loadHistory: async () => {
    try {
      set({ isLoadingHistory: true });

      const response = await voiceComparisonService.getComparisonHistory(1, 20);

      if (response.success) {
        set({
          history: response.data,
          isLoadingHistory: false,
        });
      }
    } catch (error) {
      console.error("Error loading history:", error);
      set({ isLoadingHistory: false });
    }
  },

  clearCurrentComparison: () => {
    set({
      currentComparison: null,
      votes: new Map(),
      error: null,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
