export interface ExtractContentRequest {
  url: string;
  platform?: string;
}

export interface BatchExtractContentRequest {
  urls: string[];
  platform?: string;
}

export interface ExtractedContent {
  title: string;
  description: string;
  content?: string;
  summary?: string;
  author: {
    username?: string;
    displayName: string;
    verified?: boolean;
  };
  hashtags?: string[];
  thumbnailUrl?: string;
  createdAt: string;
  platform: string;
  url: string;
}

export interface ExtractionResponse {
  status: "success" | "error";
  platform: string;
  url: string;
  metadata: ExtractedContent;
  extractedText: {
    captions?: string;
    ocrText?: string;
    content?: string;
    summary?: string;
  };
  processingTime: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface BatchExtractionResponse {
  success: boolean;
  data: {
    results: ExtractionResponse[];
    summary: {
      total: number;
      succeeded: number;
      failed: number;
    };
  };
  requestId: string;
}

export class ContentExtractionError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ContentExtractionError";
  }
}

export class ContentExtractionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    if (!this.baseUrl) {
      throw new Error("API base URL is not configured (NEXT_PUBLIC_BASE_URL)");
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const accessToken = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
  }

  async extractContent(
    request: ExtractContentRequest
  ): Promise<ExtractionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/content/extract`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentExtractionError(
          errorData?.error || "Failed to extract content",
          response.status,
          errorData?.errorCode
        );
      }

      const data = await response.json();
      return data.data;
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

  async extractMultipleContent(
    request: BatchExtractContentRequest
  ): Promise<BatchExtractionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/content/extract/batch`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ContentExtractionError(
          errorData?.error || "Failed to extract content",
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
}

export const contentExtractionService = new ContentExtractionService();
