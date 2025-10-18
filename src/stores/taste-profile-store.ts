import { create } from "zustand";
import {
  TasteProfile,
  voiceComparisonService,
} from "@/services/voice-comparison";

interface TasteProfileStore {
  // Taste profile data
  profile: TasteProfile | null;
  isLoadingProfile: boolean;

  // Recommended settings
  recommendedSettings: {
    temperature: number;
    length: "short" | "medium" | "long";
    tone: "casual" | "professional" | "friendly" | "authoritative";
    confidenceScore: number;
  } | null;
  isLoadingRecommendations: boolean;

  // Applied settings (what user is currently using)
  appliedSettings: {
    temperature: number;
    length: "short" | "medium" | "long";
    tone: "casual" | "professional" | "friendly" | "authoritative";
  } | null;

  // Actions
  loadProfile: () => Promise<void>;
  loadRecommendedSettings: () => Promise<void>;
  applyRecommendedSettings: () => void;
  updateAppliedSettings: (settings: {
    temperature?: number;
    length?: "short" | "medium" | "long";
    tone?: "casual" | "professional" | "friendly" | "authoritative";
  }) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  temperature: 0.7,
  length: "medium" as const,
  tone: "casual" as const,
};

const STORAGE_KEY = "echome_taste_profile_settings";

export const useTasteProfileStore = create<TasteProfileStore>((set, get) => ({
  profile: null,
  isLoadingProfile: false,
  recommendedSettings: null,
  isLoadingRecommendations: false,
  appliedSettings: null,

  loadProfile: async () => {
    try {
      set({ isLoadingProfile: true });

      const response = await voiceComparisonService.getTasteProfile();

      if (response.success) {
        set({
          profile: response.data,
          isLoadingProfile: false,
        });
      }
    } catch (error) {
      console.error("Error loading taste profile:", error);
      set({ isLoadingProfile: false });
    }
  },

  loadRecommendedSettings: async () => {
    try {
      set({ isLoadingRecommendations: true });

      const response = await voiceComparisonService.getRecommendedSettings();

      if (response.success) {
        set({
          recommendedSettings: response.data,
          isLoadingRecommendations: false,
        });

        // Load applied settings from localStorage or use defaults
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsedSettings = JSON.parse(stored);
            set({ appliedSettings: parsedSettings });
          } catch (error) {
            console.error("Error parsing stored settings:", error);
            set({ appliedSettings: DEFAULT_SETTINGS });
          }
        } else {
          set({ appliedSettings: DEFAULT_SETTINGS });
        }
      }
    } catch (error) {
      console.error("Error loading recommended settings:", error);
      set({
        isLoadingRecommendations: false,
        appliedSettings: DEFAULT_SETTINGS,
      });
    }
  },

  applyRecommendedSettings: () => {
    const recommendedSettings = get().recommendedSettings;

    if (recommendedSettings) {
      const newSettings = {
        temperature: recommendedSettings.temperature,
        length: recommendedSettings.length,
        tone: recommendedSettings.tone,
      };

      set({ appliedSettings: newSettings });

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error("Error saving settings to localStorage:", error);
      }
    }
  },

  updateAppliedSettings: (settings) => {
    const currentSettings = get().appliedSettings || DEFAULT_SETTINGS;
    const newSettings = {
      ...currentSettings,
      ...settings,
    };

    set({ appliedSettings: newSettings });

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  },

  resetToDefaults: () => {
    set({ appliedSettings: DEFAULT_SETTINGS });

    // Clear from localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error removing settings from localStorage:", error);
    }
  },
}));
