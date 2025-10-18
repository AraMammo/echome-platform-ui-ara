// Database Content API Service
export interface TranscriptionJob {
  id: string;
  fileId: string;
  fileName: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  updatedAt: string;
  result?: {
    transcript: string;
    confidence: number;
    language: string;
    duration: number;
  };
  error?: string;
}

export interface TranscriptionJobsResponse {
  data: TranscriptionJob[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface PdfProcessingJob {
  id: string;
  fileId: string;
  fileName: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  updatedAt: string;
  result?: {
    extractedText: string;
    metadata: {
      pageCount: number;
      title?: string;
      author?: string;
      subject?: string;
      creator?: string;
    };
    images?: string[];
    tables?: Array<{
      headers: string[];
      rows: string[][];
      caption?: string;
    }>;
  };
  error?: string;
}

export interface PdfJobsResponse {
  data: PdfProcessingJob[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface GeneratedContent {
  id: string;
  contentType: string;
  title: string;
  content: string;
  prompt: string;
  model: string;
  createdAt: string;
  metadata: {
    tokens?: number;
    cost?: number;
    quality?: number;
  };
}

export interface GeneratedContentResponse {
  content: GeneratedContent[];
  total: number;
  hasMore: boolean;
  requestId: string;
  timestamp: string;
}

export interface DatabaseContentErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
}

export class DatabaseContentServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "DatabaseContentServiceError";
  }
}

export class DatabaseContentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    if (!this.baseUrl) {
      console.warn("API base URL is not configured (NEXT_PUBLIC_BASE_URL) - API calls will not work");
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("accessToken");

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getTranscripts(params?: {
    status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    limit?: number;
    offset?: number;
  }): Promise<TranscriptionJobsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const url = `${this.baseUrl}/database/transcripts${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: DatabaseContentErrorResponse = await response.json();
        throw new DatabaseContentServiceError(
          errorData?.error || "Failed to get transcripts",
          response.status
        );
      }

      const data: TranscriptionJobsResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof DatabaseContentServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new DatabaseContentServiceError(
          "Network error: Unable to get transcripts"
        );
      }

      throw new DatabaseContentServiceError("Failed to get transcripts");
    }
  }

  async getPdfs(params?: {
    status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    limit?: number;
    offset?: number;
  }): Promise<PdfJobsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const url = `${this.baseUrl}/database/pdfs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: DatabaseContentErrorResponse = await response.json();
        throw new DatabaseContentServiceError(
          errorData?.error || "Failed to get PDFs",
          response.status
        );
      }

      const data: PdfJobsResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof DatabaseContentServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new DatabaseContentServiceError(
          "Network error: Unable to get PDFs"
        );
      }

      throw new DatabaseContentServiceError("Failed to get PDFs");
    }
  }

  async getGeneratedContent(params?: {
    contentType?: string;
    limit?: number;
    offset?: number;
  }): Promise<GeneratedContentResponse> {
    if (!this.baseUrl) {
      return this.getMockGeneratedContent(params);
    }

    try {
      const queryParams = new URLSearchParams();
      if (params?.contentType)
        queryParams.append("contentType", params.contentType);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const url = `${this.baseUrl}/database/generated-content${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: DatabaseContentErrorResponse = await response.json();
        throw new DatabaseContentServiceError(
          errorData?.error || "Failed to get generated content",
          response.status
        );
      }

      const data: GeneratedContentResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof DatabaseContentServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new DatabaseContentServiceError(
          "Network error: Unable to get generated content"
        );
      }

      throw new DatabaseContentServiceError("Failed to get generated content");
    }
  }

  private getMockGeneratedContent(params?: {
    contentType?: string;
    limit?: number;
    offset?: number;
  }): GeneratedContentResponse {
    const mockContent: GeneratedContent[] = [
      {
        id: "1",
        contentType: "blog_post",
        title: "10 Tips for Better Content Marketing",
        content: "Content marketing is essential for growing your business...",
        prompt: "Write a blog post about content marketing tips",
        model: "gpt-4",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: { tokens: 1250, cost: 0.025, quality: 95 },
      },
      {
        id: "2",
        contentType: "social_media",
        title: "Instagram Carousel: Product Launch",
        content: "Exciting news! 🎉 We're launching something amazing...",
        prompt: "Create an Instagram carousel for product launch",
        model: "gpt-4",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        metadata: { tokens: 450, cost: 0.009, quality: 92 },
      },
      {
        id: "3",
        contentType: "video_script",
        title: "YouTube Tutorial: Getting Started",
        content: "Welcome back to the channel! Today we're diving into...",
        prompt: "Write a YouTube tutorial script for beginners",
        model: "gpt-4",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { tokens: 2100, cost: 0.042, quality: 98 },
      },
      {
        id: "4",
        contentType: "newsletter",
        title: "Weekly Newsletter: Industry Updates",
        content: "Hello subscribers! Here's what's new this week...",
        prompt: "Create a weekly newsletter with industry updates",
        model: "gpt-4",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { tokens: 1800, cost: 0.036, quality: 94 },
      },
      {
        id: "5",
        contentType: "blog_post",
        title: "The Future of AI in Marketing",
        content: "Artificial intelligence is transforming how we approach marketing...",
        prompt: "Write about AI trends in marketing",
        model: "gpt-4",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { tokens: 1650, cost: 0.033, quality: 96 },
      },
    ];

    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    const filteredContent = params?.contentType
      ? mockContent.filter((c) => c.contentType === params.contentType)
      : mockContent;

    return {
      content: filteredContent.slice(offset, offset + limit),
      total: filteredContent.length,
      hasMore: offset + limit < filteredContent.length,
      requestId: "mock-request-id",
      timestamp: new Date().toISOString(),
    };
  }
}

export const databaseContentService = new DatabaseContentService();
