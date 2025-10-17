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
      throw new Error("API base URL is not configured (NEXT_PUBLIC_BASE_URL)");
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
}

export const databaseContentService = new DatabaseContentService();
