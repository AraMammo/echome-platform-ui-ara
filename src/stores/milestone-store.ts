import { create } from "zustand";

interface MilestoneState {
  celebratedMilestones: number[];
  markMilestoneCelebrated: (milestone: number) => void;
  shouldCelebrate: (fileCount: number) => number | null;
  initializeMilestones: () => void;
  resetMilestones: () => void;
}

const STORAGE_KEY = "echome_milestone_storage";

export const useMilestoneStore = create<MilestoneState>()((set, get) => ({
  celebratedMilestones: [],

  initializeMilestones: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set({ celebratedMilestones: data.celebratedMilestones || [] });
      }
    } catch (error) {
      console.error("Failed to load milestone data:", error);
    }
  },

  markMilestoneCelebrated: (milestone: number) => {
    const currentMilestones = get().celebratedMilestones;
    if (!currentMilestones.includes(milestone)) {
      const updatedMilestones = [...currentMilestones, milestone];
      set({ celebratedMilestones: updatedMilestones });

      // Persist to localStorage
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ celebratedMilestones: updatedMilestones })
        );
      } catch (error) {
        console.error("Failed to save milestone data:", error);
      }
    }
  },

  shouldCelebrate: (fileCount: number) => {
    const milestones = [10, 25, 50, 100];
    const celebrated = get().celebratedMilestones;

    // Find the highest milestone user has reached but hasn't celebrated
    for (let i = milestones.length - 1; i >= 0; i--) {
      const milestone = milestones[i];
      if (fileCount >= milestone && !celebrated.includes(milestone)) {
        return milestone;
      }
    }

    return null;
  },

  resetMilestones: () => {
    set({ celebratedMilestones: [] });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to reset milestone data:", error);
    }
  },
}));
