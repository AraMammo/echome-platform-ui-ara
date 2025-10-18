export interface ContentGenerationPayload {
  prompt: string;
  outputFormat?: string;
  maxLength?: number;
  temperature?: number;
  model?: string;
  topic?: string;
  contextType?: string;
  platform?: string;
  externalUrls?: string[];
  platformContent?: Array<{
    status: string;
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
  }>;
}

export interface ContentGenerationResponse {
  jobId: string;
  status: string;
  message: string;
  requestId: string;
  timestamp: string;
}

export interface ContentRegenerationPayload {
  originalJobId: string;
  userPrompt?: string;
}

export interface ContentRegenerationResponse {
  success: boolean;
  data: {
    jobId: string;
    originalJobId: string;
    iterationNumber: number;
    status: string;
    userPrompt: string;
    generatedContent: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface GenerationHistoryResponse {
  success: boolean;
  data: {
    originalJob: {
      jobId: string;
      status: string;
      originalPrompt: string;
      createdAt: string;
      updatedAt: string;
      iterationNumber: number;
    };
    regenerations: {
      jobId: string;
      status: string;
      userPrompt: string;
      originalPrompt: string;
      generatedContent: string;
      createdAt: string;
      updatedAt: string;
      iterationNumber: number;
    }[];
    totalIterations: number;
    latestVersion: {
      originalPrompt: string;
      userId: string;
      updatedAt: string;
      parentJobId: string;
      status: string;
      sourceFileId: string;
      jobId: string;
      userPrompt: string;
      iterationNumber: number;
      generatedContent: string;
      createdAt: string;
    };
  };
}

export interface GenerationJob {
  id: string;
  prompt: string;
  contentType: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  result?: {
    content: string;
    tokens: number;
    cost: number;
  };
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface GenerationJobsResponse {
  data: GenerationJob[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ContentGenerationErrorResponse {
  error: string;
}

export interface ContentRegenerationErrorResponse {
  error: string;
}

export class ContentGenerationError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ContentGenerationError";
  }
}

export class ContentGenerationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    if (!this.baseUrl) {
      console.warn("API base URL is not configured (NEXT_PUBLIC_BASE_URL) - API calls will not work");
    }
  }

  async generateContent(
    payload: ContentGenerationPayload
  ): Promise<ContentGenerationResponse> {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        `${this.baseUrl}/content/generate-personalized`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData: ContentGenerationErrorResponse = await response.json();
        throw new ContentGenerationError(
          errorData?.error || "Failed to generate content",
          response.status
        );
      }

      const data: ContentGenerationResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentGenerationError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new ContentGenerationError(
          "Network error: Unable to generate content"
        );
      }

      throw new ContentGenerationError("Failed to generate content");
    }
  }

  async regenerateContent(
    payload: ContentRegenerationPayload
  ): Promise<ContentRegenerationResponse> {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(`${this.baseUrl}/content/regenerate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: ContentRegenerationErrorResponse =
          await response.json();
        throw new ContentGenerationError(
          errorData?.error || "Failed to regenerate content",
          response.status
        );
      }

      const data: ContentRegenerationResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentGenerationError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new ContentGenerationError(
          "Network error: Unable to regenerate content"
        );
      }

      throw new ContentGenerationError("Failed to regenerate content");
    }
  }

  async getGenerationHistory(
    originalJobId: string
  ): Promise<GenerationHistoryResponse> {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        `${this.baseUrl}/content/generation/${originalJobId}/history`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        }
      );

      if (!response.ok) {
        const errorData: ContentGenerationErrorResponse = await response.json();
        throw new ContentGenerationError(
          errorData?.error || "Failed to get generation history",
          response.status
        );
      }

      const data: GenerationHistoryResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentGenerationError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new ContentGenerationError(
          "Network error: Unable to get generation history"
        );
      }

      throw new ContentGenerationError("Failed to get generation history");
    }
  }

  async getGenerationJobs(params?: {
    status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    limit?: number;
    offset?: number;
  }): Promise<GenerationJobsResponse> {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const url = `${this.baseUrl}/generation/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const errorData: ContentGenerationErrorResponse = await response.json();
        throw new ContentGenerationError(
          errorData?.error || "Failed to get generation jobs",
          response.status
        );
      }

      const data: GenerationJobsResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentGenerationError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new ContentGenerationError(
          "Network error: Unable to get generation jobs"
        );
      }

      throw new ContentGenerationError("Failed to get generation jobs");
    }
  }

  async getGenerationJob(jobId: string): Promise<GenerationJob> {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(`${this.baseUrl}/generation/jobs/${jobId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const errorData: ContentGenerationErrorResponse = await response.json();
        throw new ContentGenerationError(
          errorData?.error || "Failed to get generation job",
          response.status
        );
      }

      const data: GenerationJob = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof ContentGenerationError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new ContentGenerationError(
          "Network error: Unable to get generation job"
        );
      }

      throw new ContentGenerationError("Failed to get generation job");
    }
  }
}

export const contentGenerationService = new ContentGenerationService();
