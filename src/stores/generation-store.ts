import { create } from "zustand";

export type SourceType = "text" | "file" | "url" | "knowledge_base";
export type ContentFormat =
  | "blog_post"
  | "linkedin_post"
  | "tweet"
  | "instagram_caption"
  | "facebook_post"
  | "youtube_script"
  | "newsletter"
  | "video_clip";

export interface AudienceProfile {
  name: string;
  tone: string; // Professional, Casual, Friendly, Authoritative, etc.
  style: string; // Informative, Persuasive, Educational, Entertaining, etc.
  targetDemographic: string;
  painPoints: string[];
  goals: string[];
}

export interface ContentPreset {
  id: string;
  name: string;
  audience: AudienceProfile;
  formats: ContentFormat[];
  createdAt: string;
}

export interface GenerationDraft {
  // Step 1: Source
  sourceType: SourceType;
  textInput?: string;
  fileId?: string;
  fileName?: string;
  fileType?: string;
  urls?: string[];
  useKnowledgeBase: boolean;

  // Step 2: Audience
  audience: AudienceProfile;

  // Step 3: Formats
  selectedFormats: ContentFormat[];

  // Metadata
  lastUpdated: string;
}

export interface GenerationState {
  // Current wizard step (1-4)
  currentStep: number;

  // Step 1: Source
  sourceType: SourceType;
  textInput: string;
  fileId: string | null;
  fileName: string;
  fileType: string;
  urls: string[];
  useKnowledgeBase: boolean;

  // Step 2: Audience
  audience: AudienceProfile;

  // Step 3: Formats
  selectedFormats: ContentFormat[];

  // Step 4: Generation
  isGenerating: boolean;
  jobId: string | null;
  error: string | null;

  // Presets
  presets: ContentPreset[];
  currentPresetId: string | null;

  // Draft auto-save
  hasDraft: boolean;
  draftLastSaved: string | null;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Step 1 actions
  setSourceType: (type: SourceType) => void;
  setTextInput: (text: string) => void;
  setFile: (fileId: string, fileName: string, fileType: string) => void;
  clearFile: () => void;
  addUrl: (url: string) => void;
  removeUrl: (url: string) => void;
  toggleKnowledgeBase: () => void;

  // Step 2 actions
  setAudience: (audience: Partial<AudienceProfile>) => void;
  resetAudience: () => void;

  // Step 3 actions
  toggleFormat: (format: ContentFormat) => void;
  setFormats: (formats: ContentFormat[]) => void;
  clearFormats: () => void;

  // Step 4 actions
  setIsGenerating: (isGenerating: boolean) => void;
  setJobId: (jobId: string) => void;
  setError: (error: string | null) => void;

  // Preset actions
  savePreset: (name: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  updatePreset: (presetId: string, updates: Partial<ContentPreset>) => void;

  // Draft actions
  saveDraft: () => void;
  loadDraft: () => void;
  clearDraft: () => void;

  // Reset
  reset: () => void;
}

const defaultAudience: AudienceProfile = {
  name: "",
  tone: "Professional",
  style: "Informative",
  targetDemographic: "",
  painPoints: [],
  goals: [],
};

const DRAFT_STORAGE_KEY = "echome_generation_draft";
const PRESETS_STORAGE_KEY = "echome_generation_presets";

export const useGenerationStore = create<GenerationState>()((set, get) => ({
  // Initial state
  currentStep: 1,

  // Step 1
  sourceType: "text",
  textInput: "",
  fileId: null,
  fileName: "",
  fileType: "",
  urls: [],
  useKnowledgeBase: true,

  // Step 2
  audience: { ...defaultAudience },

  // Step 3
  selectedFormats: [],

  // Step 4
  isGenerating: false,
  jobId: null,
  error: null,

  // Presets
  presets: [],
  currentPresetId: null,

  // Draft
  hasDraft: false,
  draftLastSaved: null,

  // Step navigation
  setStep: (step: number) => {
    if (step >= 1 && step <= 4) {
      set({ currentStep: step });
    }
  },

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 4) {
      set({ currentStep: currentStep + 1 });
      get().saveDraft();
    }
  },

  previousStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },

  // Step 1 actions
  setSourceType: (type: SourceType) => {
    set({ sourceType: type });
    get().saveDraft();
  },

  setTextInput: (text: string) => {
    set({ textInput: text });
    get().saveDraft();
  },

  setFile: (fileId: string, fileName: string, fileType: string) => {
    set({ fileId, fileName, fileType });
    get().saveDraft();
  },

  clearFile: () => {
    set({ fileId: null, fileName: "", fileType: "" });
    get().saveDraft();
  },

  addUrl: (url: string) => {
    const { urls } = get();
    if (!urls.includes(url)) {
      set({ urls: [...urls, url] });
      get().saveDraft();
    }
  },

  removeUrl: (url: string) => {
    const { urls } = get();
    set({ urls: urls.filter((u) => u !== url) });
    get().saveDraft();
  },

  toggleKnowledgeBase: () => {
    set({ useKnowledgeBase: !get().useKnowledgeBase });
    get().saveDraft();
  },

  // Step 2 actions
  setAudience: (audienceUpdate: Partial<AudienceProfile>) => {
    set({ audience: { ...get().audience, ...audienceUpdate } });
    get().saveDraft();
  },

  resetAudience: () => {
    set({ audience: { ...defaultAudience } });
    get().saveDraft();
  },

  // Step 3 actions
  toggleFormat: (format: ContentFormat) => {
    const { selectedFormats } = get();
    if (selectedFormats.includes(format)) {
      set({ selectedFormats: selectedFormats.filter((f) => f !== format) });
    } else {
      set({ selectedFormats: [...selectedFormats, format] });
    }
    get().saveDraft();
  },

  setFormats: (formats: ContentFormat[]) => {
    set({ selectedFormats: formats });
    get().saveDraft();
  },

  clearFormats: () => {
    set({ selectedFormats: [] });
    get().saveDraft();
  },

  // Step 4 actions
  setIsGenerating: (isGenerating: boolean) => {
    set({ isGenerating });
  },

  setJobId: (jobId: string) => {
    set({ jobId });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  // Preset actions
  savePreset: (name: string) => {
    const { audience, selectedFormats, presets } = get();
    const newPreset: ContentPreset = {
      id: `preset-${Date.now()}`,
      name,
      audience: { ...audience },
      formats: [...selectedFormats],
      createdAt: new Date().toISOString(),
    };

    const updatedPresets = [...presets, newPreset];
    set({ presets: updatedPresets, currentPresetId: newPreset.id });

    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
    }
  },

  loadPreset: (presetId: string) => {
    const { presets } = get();
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      set({
        audience: { ...preset.audience },
        selectedFormats: [...preset.formats],
        currentPresetId: presetId,
      });
      get().saveDraft();
    }
  },

  deletePreset: (presetId: string) => {
    const { presets, currentPresetId } = get();
    const updatedPresets = presets.filter((p) => p.id !== presetId);
    set({
      presets: updatedPresets,
      currentPresetId: currentPresetId === presetId ? null : currentPresetId,
    });

    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
    }
  },

  updatePreset: (presetId: string, updates: Partial<ContentPreset>) => {
    const { presets } = get();
    const updatedPresets = presets.map((p) =>
      p.id === presetId ? { ...p, ...updates } : p
    );
    set({ presets: updatedPresets });

    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
    }
  },

  // Draft actions
  saveDraft: () => {
    const {
      sourceType,
      textInput,
      fileId,
      fileName,
      fileType,
      urls,
      useKnowledgeBase,
      audience,
      selectedFormats,
    } = get();

    const draft: GenerationDraft = {
      sourceType,
      textInput,
      fileId: fileId || undefined,
      fileName,
      fileType,
      urls,
      useKnowledgeBase,
      audience,
      selectedFormats,
      lastUpdated: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      set({ hasDraft: true, draftLastSaved: draft.lastUpdated });
    }
  },

  loadDraft: () => {
    if (typeof window !== "undefined") {
      const draftStr = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (draftStr) {
        try {
          const draft: GenerationDraft = JSON.parse(draftStr);
          set({
            sourceType: draft.sourceType,
            textInput: draft.textInput || "",
            fileId: draft.fileId || null,
            fileName: draft.fileName || "",
            fileType: draft.fileType || "",
            urls: draft.urls || [],
            useKnowledgeBase: draft.useKnowledgeBase,
            audience: draft.audience,
            selectedFormats: draft.selectedFormats,
            hasDraft: true,
            draftLastSaved: draft.lastUpdated,
          });
        } catch (error) {
          console.error("Failed to load draft:", error);
        }
      }

      // Load presets
      const presetsStr = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (presetsStr) {
        try {
          const presets: ContentPreset[] = JSON.parse(presetsStr);
          set({ presets });
        } catch (error) {
          console.error("Failed to load presets:", error);
        }
      }
    }
  },

  clearDraft: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      set({ hasDraft: false, draftLastSaved: null });
    }
  },

  // Reset
  reset: () => {
    set({
      currentStep: 1,
      sourceType: "text",
      textInput: "",
      fileId: null,
      fileName: "",
      fileType: "",
      urls: [],
      useKnowledgeBase: true,
      audience: { ...defaultAudience },
      selectedFormats: [],
      isGenerating: false,
      jobId: null,
      error: null,
      currentPresetId: null,
    });
    get().clearDraft();
  },
}));
