import { ContentExtractionError } from "./contentExtractionService";

export interface ExtractContentRequest {
  url: string;
  platform?: string;
}

export interface BatchExtractContentRequest {
  urls: string[];
  platform?: string;
}

export interface ExtractionResponse {
  status: "success" | "error";
  platform: string;
  url: string;
  metadata: {
    title: string;
    description: string;
    author: {
      username: string;
      displayName: string;
      verified: boolean;
    };
    hashtags?: string[];
    thumbnailUrl?: string;
    createdAt: string;
    content?: string;
    summary?: string;
  };
  extractedText: {
    captions?: string;
    ocrText?: string;
    content?: string;
    summary?: string;
  };
  processingTime: number;
  rateLimit?: {
    remaining: number;
    resetTime: string;
  };
}

export interface BatchExtractionItemResult {
  url: string;
  status: "success" | "error" | "rate_limited";
  data?: ExtractionResponse;
  errorCode?: string;
  errorMessage?: string;
}

export interface BatchExtractionResponse {
  status: "success" | "partial" | "failed";
  results: BatchExtractionItemResult[];
  summary: {
    total: number;
    succeeded: number;
    failed: number;
    rateLimited: number;
  };
  rateLimit: {
    remaining: number;
    resetTime: string;
  };
  processingTime: number;
}

export interface MonitoredCreator {
  id: string;
  url: string;
  platform: string;
  creatorName?: string;
  creatorUsername?: string;
  automationEnabled: number;
  pollingInterval: number;
  lastChecked?: string;
  nextCheck?: string;
  totalChecks: number;
  successfulChecks: number;
  extractedData?: {
    title: string;
    description: string;
    author: {
      username: string;
      displayName: string;
      verified: boolean;
    };
    hashtags?: string[];
    thumbnailUrl?: string;
    createdAt: string;
    content?: string;
    summary?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonitoredCreatorRequest {
  url: string;
  platform: string;
  automationEnabled?: number;
  pollingInterval?: number;
}

export interface UpdateMonitoredCreatorRequest {
  automationEnabled?: number;
  pollingInterval?: number;
  creatorName?: string;
  creatorUsername?: string;
}

export interface ContentHistory {
  id: string;
  creatorId: string;
  extractedData?: {
    title: string;
    description: string;
    author: {
      username: string;
      displayName: string;
      verified: boolean;
    };
    hashtags?: string[];
    thumbnailUrl?: string;
    createdAt: string;
    content?: string;
    summary?: string;
  };
  status: "success" | "error";
  errorMessage?: string;
  contentHash?: string;
  newContentDetected: number;
  extractedAt: string;
}

export interface PollingStatus {
  isRunning: boolean;
  pollFrequency: number;
  creatorsDueForPolling: number;
  totalCreators: number;
}

export class RepurposeEngineService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  }

  private getAuthHeaders(): Record<string, string> {
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    return {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
  }

  /**
   * Extract content from a single URL
   */
  async extractContent(
    request: ExtractContentRequest
  ): Promise<ExtractionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/extract`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentExtractionError(
          errorData?.message || "Failed to extract content",
          response.status,
          errorData?.errorCode
        );
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentExtractionError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new ContentExtractionError(
          "Network error: Unable to extract content"
        );
      }

      throw new ContentExtractionError("Failed to extract content");
    }
  }

  async batchExtractContent(
    request: BatchExtractContentRequest
  ): Promise<BatchExtractionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/extract/batch`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentExtractionError(
          errorData?.message || "Failed to batch extract content",
          response.status,
          errorData?.errorCode
        );
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentExtractionError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new ContentExtractionError(
          "Network error: Unable to batch extract content"
        );
      }

      throw new ContentExtractionError("Failed to batch extract content");
    }
  }

  async extractYouTubeContent(url: string): Promise<ExtractionResponse> {
    return this.extractContent({ url, platform: "youtube" });
  }

  async extractTikTokContent(url: string): Promise<ExtractionResponse> {
    return this.extractContent({ url, platform: "tiktok" });
  }

  async extractInstagramContent(url: string): Promise<ExtractionResponse> {
    return this.extractContent({ url, platform: "instagram" });
  }

  async extractLinkedInContent(url: string): Promise<ExtractionResponse> {
    return this.extractContent({ url, platform: "linkedin" });
  }

  async extractArticleContent(url: string): Promise<ExtractionResponse> {
    return this.extractContent({ url, platform: "article" });
  }

  async getMonitoredCreators(): Promise<MonitoredCreator[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/monitored-creators`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentExtractionError(
          errorData?.message || "Failed to fetch monitored creators",
          response.status,
          errorData?.errorCode
        );
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentExtractionError) {
        throw error;
      }

      throw new ContentExtractionError("Failed to fetch monitored creators");
    }
  }

  async createMonitoredCreator(
    request: CreateMonitoredCreatorRequest
  ): Promise<MonitoredCreator> {
    try {
      const response = await fetch(`${this.baseUrl}/api/monitored-creators`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentExtractionError(
          errorData?.message || "Failed to create monitored creator",
          response.status,
          errorData?.errorCode
        );
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentExtractionError) {
        throw error;
      }

      throw new ContentExtractionError("Failed to create monitored creator");
    }
  }

  async updateMonitoredCreator(
    id: string,
    request: UpdateMonitoredCreatorRequest
  ): Promise<MonitoredCreator> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/monitored-creators/${id}`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentExtractionError(
          errorData?.message || "Failed to update monitored creator",
          response.status,
          errorData?.errorCode
        );
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentExtractionError) {
        throw error;
      }

      throw new ContentExtractionError("Failed to update monitored creator");
    }
  }

  async deleteMonitoredCreator(id: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/monitored-creators/${id}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentExtractionError(
          errorData?.message || "Failed to delete monitored creator",
          response.status,
          errorData?.errorCode
        );
      }
    } catch (error: unknown) {
      if (error instanceof ContentExtractionError) {
        throw error;
      }

      throw new ContentExtractionError("Failed to delete monitored creator");
    }
  }

  async getContentHistory(
    creatorId: string,
    limit: number = 50
  ): Promise<ContentHistory[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/monitored-creators/${creatorId}/history?limit=${limit}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentExtractionError(
          errorData?.message || "Failed to fetch content history",
          response.status,
          errorData?.errorCode
        );
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentExtractionError) {
        throw error;
      }

      throw new ContentExtractionError("Failed to fetch content history");
    }
  }

  async getRecentActivity(limit: number = 50): Promise<ContentHistory[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/recent-activity?limit=${limit}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentExtractionError(
          errorData?.message || "Failed to fetch recent activity",
          response.status,
          errorData?.errorCode
        );
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentExtractionError) {
        throw error;
      }

      throw new ContentExtractionError("Failed to fetch recent activity");
    }
  }

  async manualPollCreator(
    creatorId: string
  ): Promise<{ success: boolean; message: string; data?: unknown }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/monitored-creators/${creatorId}/poll`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData: { message?: string; errorCode?: string } =
          await response.json();
        throw new ContentExtractionError(
          errorData?.message || "Failed to manually poll creator",
          response.status,
          errorData?.errorCode
        );
      }

      const data: { success: boolean; message: string; data?: unknown } =
        await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentExtractionError) {
        throw error;
      }

      throw new ContentExtractionError("Failed to manually poll creator");
    }
  }

  async getPollingStatus(): Promise<PollingStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/polling/status`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: { message?: string; errorCode?: string } =
          await response.json();
        throw new ContentExtractionError(
          errorData?.message || "Failed to fetch polling status",
          response.status,
          errorData?.errorCode
        );
      }

      const data: PollingStatus = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentExtractionError) {
        throw error;
      }

      throw new ContentExtractionError("Failed to fetch polling status");
    }
  }

  validateUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  detectPlatform(url: string): string | null {
    const platformPatterns = {
      youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
      tiktok: /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
      instagram: /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
      linkedin: /linkedin\.com\/posts\/([a-zA-Z0-9_-]+)/,
      article: /^https?:\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/,
    };

    for (const [platform, pattern] of Object.entries(platformPatterns)) {
      if (pattern.test(url)) {
        return platform;
      }
    }
    return null;
  }

  getPlatformDisplayName(platform: string): string {
    const platformNames = {
      youtube: "YouTube",
      tiktok: "TikTok",
      instagram: "Instagram",
      linkedin: "LinkedIn",
      article: "Article/Blog",
      twitter: "Twitter",
    };
    return platformNames[platform as keyof typeof platformNames] || platform;
  }
}

export const repurposeEngineService = new RepurposeEngineService();
