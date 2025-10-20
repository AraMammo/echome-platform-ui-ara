export interface ContentKitRequest {
  inputType: "video" | "prompt" | "voice_note" | "social_import";
  inputData: {
    fileId?: string;
    text?: string;
    content?: string;
    userId: string;
  };
}

export interface ContentKitResponse {
  jobId: string;
  status: string;
  message: string;
  requestId: string;
  timestamp: string;
}

export interface ContentKitStatus {
  jobId: string;
  userId: string;
  kitName: string;
  inputType: string;
  inputData: Record<string, unknown>;
  outputs: {
    transcript?: string;
    blogPost?: string;
    blogHeaderImage?: string;
    linkedInPost?: string;
    tweets?: string[];
    instagramCarousel?: string[];
    instagramCarouselImages?: string[];
    facebookPost?: string;
    youtubeScript?: string;
    newsletter?: string;
    videoClips?: Array<{
      original: string;
      vertical: string;
      horizontal: string;
      square: string;
      metadata: {
        startTime: number;
        duration: number;
        text: string;
        engagementScore: number;
      };
    }>;
  };
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  progress?: {
    currentStep: string;
    completedSteps: string[];
    totalSteps: number;
    percentage: number;
    estimatedTimeRemaining?: number;
  };
}

export interface ContentKitDownloadResponse {
  success: boolean;
  downloadUrl: string;
  fileSize: number;
}

export interface ContentKitListItem {
  jobId: string;
  kitName: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  inputType: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  outputs: {
    hasTranscript: boolean;
    hasBlogPost: boolean;
    hasLinkedInPost: boolean;
    hasTweets: boolean;
    hasInstagramCarousel: boolean;
    hasFacebookPost: boolean;
    hasYouTubeScript: boolean;
    hasVideoClips: boolean;
    videoClipCount: number;
  };
}

export interface ContentKitListResponse {
  contentKits: ContentKitListItem[];
  totalCount: number;
  nextToken?: string;
}

export interface BatchItem {
  inputType: "video" | "prompt" | "voice_note" | "social_import";
  inputData: {
    fileId?: string;
    text?: string;
    contentType?: string;
    source?: string;
    content?: string;
  };
}

export interface BatchGenerateRequest {
  batchName: string;
  items: BatchItem[];
}

export interface BatchGenerateResponse {
  batchId: string;
  status: string;
  message: string;
  requestId: string;
  timestamp: string;
}

export interface BatchItemDetail {
  itemId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  inputType: string;
  inputData: Record<string, unknown>;
  order: number;
  jobId?: string;
  error?: string;
}

export interface BatchJobStatus {
  batchId: string;
  userId: string;
  batchName: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: string;
  updatedAt?: string;
  totalItems: number;
  processedItems: number;
  completedItems: number;
  failedItems: number;
  itemDetails: BatchItemDetail[];
}

export class ContentKitServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ContentKitServiceError";
  }
}

export class ContentKitService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    if (!this.baseUrl) {
      console.warn(
        "API base URL is not configured (NEXT_PUBLIC_BASE_URL) - API calls will not work"
      );
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async generateContentKit(
    request: ContentKitRequest
  ): Promise<ContentKitResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/content-kit/generate`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok && response.status !== 202) {
        const errorData = await response.json();
        throw new ContentKitServiceError(
          errorData.error || "Failed to generate content kit",
          response.status
        );
      }

      const data: ContentKitResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ContentKitServiceError) {
        throw error;
      }
      throw new ContentKitServiceError(
        "Network error: Unable to generate content kit"
      );
    }
  }

  async getContentKitStatus(jobId: string): Promise<ContentKitStatus> {
    try {
      const response = await fetch(
        `${this.baseUrl}/content-kit/${jobId}/status`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentKitServiceError(
          errorData.error || "Failed to get content kit status",
          response.status
        );
      }

      const data: ContentKitStatus = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ContentKitServiceError) {
        throw error;
      }
      throw new ContentKitServiceError(
        "Network error: Unable to get content kit status"
      );
    }
  }

  async downloadContentKit(jobId: string): Promise<ContentKitDownloadResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/content-kit/${jobId}/download`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentKitServiceError(
          errorData.error || "Failed to download content kit",
          response.status
        );
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      return {
        success: true,
        downloadUrl,
        fileSize: blob.size,
      };
    } catch (error) {
      if (error instanceof ContentKitServiceError) {
        throw error;
      }
      throw new ContentKitServiceError(
        "Network error: Unable to download content kit"
      );
    }
  }

  async listContentKits(
    limit: number = 20,
    nextToken?: string
  ): Promise<ContentKitListResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(nextToken && { nextToken }),
      });

      const response = await fetch(`${this.baseUrl}/content-kit?${params}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentKitServiceError(
          errorData.error || "Failed to list content kits",
          response.status
        );
      }

      const data: ContentKitListResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ContentKitServiceError) {
        throw error;
      }
      throw new ContentKitServiceError(
        "Network error: Unable to list content kits"
      );
    }
  }

  async generateBatch(
    request: BatchGenerateRequest
  ): Promise<BatchGenerateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/content-kit/batch`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok && response.status !== 202) {
        const errorData = await response.json();
        throw new ContentKitServiceError(
          errorData.error || "Failed to generate batch",
          response.status
        );
      }

      const data: BatchGenerateResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ContentKitServiceError) {
        throw error;
      }
      throw new ContentKitServiceError(
        "Network error: Unable to generate batch"
      );
    }
  }

  async getBatchStatus(batchId: string): Promise<BatchJobStatus> {
    try {
      const response = await fetch(
        `${this.baseUrl}/content-kit/batch/${batchId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentKitServiceError(
          errorData.error || "Failed to get batch status",
          response.status
        );
      }

      const data: BatchJobStatus = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ContentKitServiceError) {
        throw error;
      }
      throw new ContentKitServiceError(
        "Network error: Unable to get batch status"
      );
    }
  }

  async deleteContentKit(
    jobId: string
  ): Promise<{ message: string; jobId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/content-kit/${jobId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentKitServiceError(
          errorData.error || "Failed to delete content kit",
          response.status
        );
      }

      const data: { message: string; jobId: string } = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ContentKitServiceError) {
        throw error;
      }
      throw new ContentKitServiceError(
        "Network error: Unable to delete content kit"
      );
    }
  }
}

export const contentKitService = new ContentKitService();
