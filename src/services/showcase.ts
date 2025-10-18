import { apiClient } from "./api-client";

export interface BeforeAfterComparison {
  id: string;
  prompt: string;
  genericOutput: string;
  personalizedOutput: string;
  improvementMetrics: {
    personalityScore: number;
    toneMatch: number;
    styleConsistency: number;
    overallImprovement: number;
  };
  createdAt: string;
}

export interface ShareCard {
  id: string;
  userId: string;
  cardData: {
    fileCount: number;
    voiceAccuracy: number;
    contentTypes: string[];
    testimonial?: string;
    exampleOutput?: string;
  };
  shareUrl: string;
  trackingId: string;
  views: number;
  clicks: number;
  createdAt: string;
}

export interface ShareMetrics {
  cardId: string;
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number;
  platforms: {
    twitter: number;
    linkedin: number;
    facebook: number;
    direct: number;
  };
  timeline: Array<{
    date: string;
    views: number;
    clicks: number;
  }>;
}

export interface ExamplePrompt {
  id: string;
  category: string;
  prompt: string;
  description: string;
}

export interface GenerateBeforeAfterRequest {
  prompt: string;
  includeMetrics?: boolean;
}

export interface GenerateBeforeAfterResponse {
  success: boolean;
  data: BeforeAfterComparison;
}

export interface CreateShareCardRequest {
  testimonial?: string;
  includeExample?: boolean;
  examplePrompt?: string;
}

export interface CreateShareCardResponse {
  success: boolean;
  data: ShareCard;
}

export interface GetShareMetricsResponse {
  success: boolean;
  data: ShareMetrics;
}

export interface GetExamplePromptsResponse {
  success: boolean;
  data: ExamplePrompt[];
}

class ShowcaseService {
  /**
   * Generate before/after comparison (generic AI vs personalized)
   */
  async generateBeforeAfter(
    request: GenerateBeforeAfterRequest
  ): Promise<GenerateBeforeAfterResponse> {
    // MOCK IMPLEMENTATION
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const genericOutput = `Thank you for reaching out regarding ${request.prompt}. I appreciate your interest and consideration. After reviewing my schedule and current commitments, I must respectfully decline at this time. I value the opportunity and hope we can connect in the future when timing aligns better. Please feel free to reach out again.`;

    const personalizedOutput = `Hey! Thanks so much for thinking of me for this. I really appreciate it! Unfortunately, I'm completely swamped right now and wouldn't be able to give this the attention it deserves. I hate to pass, but my plate's pretty full at the moment. Let's definitely keep in touch though - I'd love to revisit when things calm down a bit. Sound good?`;

    const comparison: BeforeAfterComparison = {
      id: `comparison-${Date.now()}`,
      prompt: request.prompt,
      genericOutput,
      personalizedOutput,
      improvementMetrics: {
        personalityScore: 87,
        toneMatch: 92,
        styleConsistency: 85,
        overallImprovement: 34,
      },
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: comparison,
    };

    // REAL IMPLEMENTATION (commented out):
    // const response = await apiClient.post<GenerateBeforeAfterResponse>(
    //   "/showcase/before-after",
    //   request
    // );
    // return response.data;
  }

  /**
   * Get example prompts for testing
   */
  async getExamplePrompts(): Promise<GetExamplePromptsResponse> {
    const response = await apiClient.get<GetExamplePromptsResponse>(
      "/showcase/example-prompts"
    );

    return response as GetExamplePromptsResponse;
  }

  /**
   * Get a specific before/after comparison by ID
   */
  async getComparison(
    comparisonId: string
  ): Promise<{ success: boolean; data: BeforeAfterComparison }> {
    const response = await apiClient.get<{
      success: boolean;
      data: BeforeAfterComparison;
    }>(`/showcase/comparison/${comparisonId}`);

    return response;
  }

  /**
   * Get user's comparison history
   */
  async getComparisonHistory(): Promise<{
    success: boolean;
    data: BeforeAfterComparison[];
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: BeforeAfterComparison[];
    }>("/showcase/comparisons");

    return response;
  }

  /**
   * Create a shareable voice card
   */
  async createShareCard(
    request: CreateShareCardRequest
  ): Promise<CreateShareCardResponse> {
    const response = await apiClient.post<CreateShareCardResponse>(
      "/showcase/share-card",
      request
    );

    return response;
  }

  /**
   * Get user's share cards
   */
  async getShareCards(): Promise<{ success: boolean; data: ShareCard[] }> {
    const response = await apiClient.get<{
      success: boolean;
      data: ShareCard[];
    }>("/showcase/share-cards");

    return response;
  }

  /**
   * Get a specific share card by ID
   */
  async getShareCard(
    cardId: string
  ): Promise<{ success: boolean; data: ShareCard }> {
    const response = await apiClient.get<{
      success: boolean;
      data: ShareCard;
    }>(`/showcase/share-card/${cardId}`);

    return response;
  }

  /**
   * Track share metrics for a card
   */
  async trackShareMetrics(cardId: string): Promise<GetShareMetricsResponse> {
    const response = await apiClient.get<GetShareMetricsResponse>(
      `/showcase/share-card/${cardId}/metrics`
    );

    return response;
  }

  /**
   * Record a view for a share card
   */
  async recordView(cardId: string, referrer?: string): Promise<void> {
    await apiClient.post(`/showcase/share-card/${cardId}/view`, {
      referrer,
    });
  }

  /**
   * Record a click for a share card
   */
  async recordClick(cardId: string, platform?: string): Promise<void> {
    await apiClient.post(`/showcase/share-card/${cardId}/click`, {
      platform,
    });
  }

  /**
   * Delete a share card
   */
  async deleteShareCard(
    cardId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/showcase/share-card/${cardId}`);

    return response;
  }

  /**
   * Share card to social media platform
   */
  shareToSocial(
    shareUrl: string,
    platform: "twitter" | "linkedin" | "facebook"
  ) {
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Check out how Echo Me captured my voice!")}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  }

  /**
   * Copy share URL to clipboard
   */
  async copyShareUrl(shareUrl: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch (error) {
      console.error("Failed to copy URL:", error);
      return false;
    }
  }
}

export const showcaseService = new ShowcaseService();
