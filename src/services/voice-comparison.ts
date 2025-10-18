import { apiClient } from "./api-client";

export interface ComparisonConfig {
  temperature?: number;
  maxTokens?: number;
  tone?: "casual" | "professional" | "friendly" | "authoritative";
  length?: "short" | "medium" | "long";
}

export interface ComparisonOutput {
  id: string;
  content: string;
  config: ComparisonConfig;
  generatedAt: string;
}

export interface ComparisonResult {
  comparisonId: string;
  prompt: string;
  outputs: ComparisonOutput[];
  createdAt: string;
}

export interface UserPreference {
  outputId: string;
  vote: "up" | "down";
  comparisonId: string;
}

export interface TasteProfile {
  userId: string;
  preferredTemperature: number;
  preferredLength: "short" | "medium" | "long";
  preferredTone: "casual" | "professional" | "friendly" | "authoritative";
  confidenceScore: number;
  totalComparisons: number;
  patterns: {
    temperaturePreference: { value: number; percentage: number };
    lengthPreference: { value: string; percentage: number };
    tonePreference: { value: string; percentage: number };
  };
}

export interface GenerateMultipleVersionsRequest {
  prompt: string;
  versionCount: number;
  configs?: ComparisonConfig[];
}

export interface GenerateMultipleVersionsResponse {
  success: boolean;
  data: ComparisonResult;
}

export interface RecordPreferenceRequest {
  comparisonId: string;
  outputId: string;
  vote: "up" | "down";
}

export interface RecordPreferenceResponse {
  success: boolean;
  message: string;
}

export interface GetTasteProfileResponse {
  success: boolean;
  data: TasteProfile;
}

export interface GetRecommendedSettingsResponse {
  success: boolean;
  data: {
    temperature: number;
    length: "short" | "medium" | "long";
    tone: "casual" | "professional" | "friendly" | "authoritative";
    confidenceScore: number;
  };
}

export interface GetComparisonHistoryResponse {
  success: boolean;
  data: ComparisonResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

class VoiceComparisonService {
  /**
   * Generate mock outputs for testing (will be replaced with API call)
   */
  private generateMockOutput(
    prompt: string,
    config: ComparisonConfig,
    index: number
  ): string {
    const templates = {
      professional: `As a professional approach to "${prompt}", I would recommend focusing on strategic implementation and measurable outcomes. This ensures alignment with organizational goals while maintaining high standards of quality and efficiency.`,
      casual: `Hey! So about "${prompt}" - here's my take: it's really about finding what works for you and not overthinking it. I've found that keeping things simple usually leads to the best results.`,
      friendly: `I'm excited to share my thoughts on "${prompt}"! From my experience, the key is staying authentic and connecting with your audience. It's all about building meaningful relationships and creating value together.`,
      authoritative: `Regarding "${prompt}", industry best practices demonstrate that systematic approaches yield optimal results. Based on extensive research and proven methodologies, the recommended framework involves...`,
    };

    const lengthMultipliers = {
      short: 0.6,
      medium: 1.0,
      long: 1.5,
    };

    let baseContent =
      templates[config.tone || "casual"] ||
      `Response to "${prompt}" with temperature ${config.temperature}`;

    // Simulate temperature variation
    if (config.temperature && config.temperature > 0.8) {
      baseContent += ` With higher creativity, we can explore innovative approaches and think outside conventional boundaries. This opens up exciting possibilities!`;
    } else if (config.temperature && config.temperature < 0.6) {
      baseContent += ` A structured, methodical approach ensures consistent and reliable outcomes.`;
    }

    // Adjust for length
    const multiplier = lengthMultipliers[config.length || "medium"];
    if (multiplier > 1) {
      baseContent += `\n\nAdditionally, it's important to consider the broader context and long-term implications. Success in this area requires continuous refinement and adaptation based on feedback and results.`;
    }

    return baseContent;
  }

  /**
   * Generate multiple versions of content with different configurations
   */
  async generateMultipleVersions(
    request: GenerateMultipleVersionsRequest
  ): Promise<GenerateMultipleVersionsResponse> {
    // MOCK IMPLEMENTATION - will be replaced with real API call
    // Simulating API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Default configurations for A/B testing if not provided
    const defaultConfigs: ComparisonConfig[] = [
      { temperature: 0.5, tone: "professional", length: "medium" },
      { temperature: 0.7, tone: "casual", length: "medium" },
      { temperature: 0.9, tone: "friendly", length: "medium" },
      { temperature: 0.6, tone: "authoritative", length: "medium" },
      { temperature: 0.8, tone: "casual", length: "long" },
    ];

    const configs =
      request.configs ||
      defaultConfigs.slice(0, Math.min(request.versionCount, 5));

    const outputs: ComparisonOutput[] = configs.map((config, index) => ({
      id: `output-${Date.now()}-${index}`,
      content: this.generateMockOutput(request.prompt, config, index),
      config,
      generatedAt: new Date().toISOString(),
    }));

    const comparisonResult: ComparisonResult = {
      comparisonId: `comparison-${Date.now()}`,
      prompt: request.prompt,
      outputs,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: comparisonResult,
    };

    // REAL IMPLEMENTATION (commented out for now):
    // const response = await apiClient.post<GenerateMultipleVersionsResponse>(
    //   "/voice-comparison/generate",
    //   {
    //     prompt: request.prompt,
    //     versionCount: request.versionCount,
    //     configs,
    //   }
    // );
    // return response.data;
  }

  /**
   * Record user preference for a specific output
   */
  async recordPreference(
    request: RecordPreferenceRequest
  ): Promise<RecordPreferenceResponse> {
    // MOCK IMPLEMENTATION - store in localStorage
    try {
      const stored = localStorage.getItem("echome_votes") || "[]";
      const votes = JSON.parse(stored);
      votes.push({
        ...request,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("echome_votes", JSON.stringify(votes));

      return {
        success: true,
        message: "Vote recorded successfully",
      };
    } catch (error) {
      console.error("Error recording preference:", error);
      return {
        success: false,
        message: "Failed to record vote",
      };
    }

    // REAL IMPLEMENTATION (commented out for now):
    // const response = await apiClient.post<RecordPreferenceResponse>(
    //   "/voice-comparison/preference",
    //   request
    // );
    // return response.data;
  }

  /**
   * Get user's taste profile based on voting history
   */
  async getTasteProfile(): Promise<GetTasteProfileResponse> {
    const response = await apiClient.get<GetTasteProfileResponse>(
      "/voice-comparison/taste-profile"
    );

    return response;
  }

  /**
   * Get recommended settings based on user's preferences
   */
  async getRecommendedSettings(): Promise<GetRecommendedSettingsResponse> {
    const response = await apiClient.get<GetRecommendedSettingsResponse>(
      "/voice-comparison/recommended-settings"
    );

    return response;
  }

  /**
   * Get comparison history with pagination
   */
  async getComparisonHistory(
    page: number = 1,
    limit: number = 10
  ): Promise<GetComparisonHistoryResponse> {
    const response = await apiClient.get<GetComparisonHistoryResponse>(
      `/voice-comparison/history?page=${page}&limit=${limit}`
    );

    return response;
  }

  /**
   * Get a specific comparison by ID
   */
  async getComparison(comparisonId: string): Promise<ComparisonResult> {
    const response = await apiClient.get<{
      success: boolean;
      data: ComparisonResult;
    }>(`/voice-comparison/${comparisonId}`);

    return response.data;
  }

  /**
   * Delete a comparison
   */
  async deleteComparison(comparisonId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/voice-comparison/${comparisonId}`
    );

    return response;
  }
}

export const voiceComparisonService = new VoiceComparisonService();
