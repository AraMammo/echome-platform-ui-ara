import { create } from "zustand";
import {
  VoiceSnapshot,
  VoiceTimeline,
  VoiceDriftAlert,
  voiceSnapshotService,
} from "@/services/voice-snapshot";

interface VoiceEvolutionStore {
  // Timeline data
  timeline: VoiceTimeline | null;
  isLoadingTimeline: boolean;

  // Snapshots
  snapshots: VoiceSnapshot[];
  isLoadingSnapshots: boolean;

  // Drift detection
  driftAlert: VoiceDriftAlert | null;
  isDriftDismissed: boolean;

  // Comparison state
  selectedSnapshotA: VoiceSnapshot | null;
  selectedSnapshotB: VoiceSnapshot | null;
  comparisonResult: unknown | null;
  isComparing: boolean;

  // Actions
  loadTimeline: () => Promise<void>;
  loadSnapshots: () => Promise<void>;
  checkDrift: () => Promise<void>;
  createSnapshot: (milestone: number, label?: string) => Promise<void>;
  compareSnapshots: (snapshotAId: string, snapshotBId: string) => Promise<void>;
  rollbackToSnapshot: (snapshotId: string) => Promise<boolean>;
  dismissDriftAlert: () => void;
  setSelectedSnapshotA: (snapshot: VoiceSnapshot | null) => void;
  setSelectedSnapshotB: (snapshot: VoiceSnapshot | null) => void;
  clearComparison: () => void;
}

export const useVoiceEvolutionStore = create<VoiceEvolutionStore>(
  (set, get) => ({
    timeline: null,
    isLoadingTimeline: false,
    snapshots: [],
    isLoadingSnapshots: false,
    driftAlert: null,
    isDriftDismissed: false,
    selectedSnapshotA: null,
    selectedSnapshotB: null,
    comparisonResult: null,
    isComparing: false,

    loadTimeline: async () => {
      try {
        set({ isLoadingTimeline: true });

        const response = await voiceSnapshotService.getTimeline();

        if (response.success) {
          set({
            timeline: response.data,
            isLoadingTimeline: false,
          });
        }
      } catch (error) {
        console.error("Error loading timeline:", error);
        set({ isLoadingTimeline: false });
      }
    },

    loadSnapshots: async () => {
      try {
        set({ isLoadingSnapshots: true });

        const response = await voiceSnapshotService.getSnapshots();

        if (response.success) {
          set({
            snapshots: response.data,
            isLoadingSnapshots: false,
          });
        }
      } catch (error) {
        console.error("Error loading snapshots:", error);
        set({ isLoadingSnapshots: false });
      }
    },

    checkDrift: async () => {
      try {
        const response = await voiceSnapshotService.detectVoiceDrift();

        if (response.success && response.data.detected) {
          set({
            driftAlert: response.data,
            isDriftDismissed: false,
          });
        }
      } catch (error) {
        console.error("Error checking drift:", error);
      }
    },

    createSnapshot: async (milestone: number, label?: string) => {
      try {
        const response = await voiceSnapshotService.createSnapshot({
          milestone,
          label,
        });

        if (response.success) {
          // Reload snapshots and timeline
          await get().loadSnapshots();
          await get().loadTimeline();
        }
      } catch (error) {
        console.error("Error creating snapshot:", error);
      }
    },

    compareSnapshots: async (snapshotAId: string, snapshotBId: string) => {
      try {
        set({ isComparing: true });

        const response = await voiceSnapshotService.compareSnapshots({
          snapshotAId,
          snapshotBId,
        });

        if (response.success) {
          set({
            comparisonResult: response.data,
            isComparing: false,
          });
        }
      } catch (error) {
        console.error("Error comparing snapshots:", error);
        set({ isComparing: false });
      }
    },

    rollbackToSnapshot: async (snapshotId: string): Promise<boolean> => {
      try {
        const response = await voiceSnapshotService.rollbackToSnapshot({
          snapshotId,
          confirm: true,
        });

        if (response.success) {
          // Reload timeline and snapshots
          await get().loadTimeline();
          await get().loadSnapshots();
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error rolling back:", error);
        return false;
      }
    },

    dismissDriftAlert: () => {
      set({ isDriftDismissed: true });
    },

    setSelectedSnapshotA: (snapshot: VoiceSnapshot | null) => {
      set({ selectedSnapshotA: snapshot });
    },

    setSelectedSnapshotB: (snapshot: VoiceSnapshot | null) => {
      set({ selectedSnapshotB: snapshot });
    },

    clearComparison: () => {
      set({
        comparisonResult: null,
        selectedSnapshotA: null,
        selectedSnapshotB: null,
      });
    },
  })
);
