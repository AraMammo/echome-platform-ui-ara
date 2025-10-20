export interface KnowledgeBaseContent {
  id: string;
  title: string;
  contentType: "transcript" | "pdf" | "generated";
  content: string;
  metadata: {
    source?: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    author?: string;
  };
  vectorEmbedding?: number[];
}

export interface KnowledgeBaseContentResponse {
  data: KnowledgeBaseContent[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface KnowledgeBaseSearchRequest {
  query: string;
  contentType?: "transcript" | "pdf" | "generated";
  limit?: number;
  offset?: number;
}

export interface KnowledgeBaseSearchResult extends KnowledgeBaseContent {
  relevanceScore: number;
  matchedSnippets: string[];
}

export interface KnowledgeBaseSearchResponse {
  data: KnowledgeBaseSearchResult[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface VectorSearchRequest {
  query: string;
  topK?: number;
  filter?: Record<string, string | number | boolean | string[]>;
  includeMetadata?: boolean;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: Record<string, string | number | boolean | string[]>;
  content?: string;
}

export interface VectorSearchResponse {
  results: VectorSearchResult[];
  totalResults: number;
}

export interface KnowledgeBaseErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
}

export interface UploadContentRequest {
  content: string;
  title?: string;
  contentType:
    | "blog_post"
    | "linkedin_post"
    | "tweet"
    | "email"
    | "instagram_caption"
    | "article"
    | "other";
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UploadContentResponse {
  contentId: string;
  userId: string;
  message: string;
  vectorCount: number;
  requestId: string;
  timestamp: string;
}

export class KnowledgeBaseServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "KnowledgeBaseServiceError";
  }
}

export class KnowledgeBaseService {
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
      throw new Error("No access token available");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getContent(params?: {
    contentType?: "transcript" | "pdf" | "generated";
    limit?: number;
    offset?: number;
  }): Promise<KnowledgeBaseContentResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.contentType)
        queryParams.append("contentType", params.contentType);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const url = `${this.baseUrl}/knowledge-base/content${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: KnowledgeBaseErrorResponse = await response.json();
        throw new KnowledgeBaseServiceError(
          errorData?.error || "Failed to get knowledge base content",
          response.status
        );
      }

      const data: KnowledgeBaseContentResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof KnowledgeBaseServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new KnowledgeBaseServiceError(
          "Network error: Unable to get knowledge base content"
        );
      }

      throw new KnowledgeBaseServiceError(
        "Failed to get knowledge base content"
      );
    }
  }

  async searchContent(
    params: KnowledgeBaseSearchRequest
  ): Promise<KnowledgeBaseSearchResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("query", params.query);
      if (params.contentType)
        queryParams.append("contentType", params.contentType);
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.offset) queryParams.append("offset", params.offset.toString());

      const url = `${this.baseUrl}/knowledge-base/search?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: KnowledgeBaseErrorResponse = await response.json();
        throw new KnowledgeBaseServiceError(
          errorData?.error || "Failed to search knowledge base",
          response.status
        );
      }

      const data: KnowledgeBaseSearchResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof KnowledgeBaseServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new KnowledgeBaseServiceError(
          "Network error: Unable to search knowledge base"
        );
      }

      throw new KnowledgeBaseServiceError("Failed to search knowledge base");
    }
  }

  async vectorSearch(
    payload: VectorSearchRequest
  ): Promise<VectorSearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/langchain/vector-search`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: KnowledgeBaseErrorResponse = await response.json();
        throw new KnowledgeBaseServiceError(
          errorData?.error || "Failed to perform vector search",
          response.status
        );
      }

      const data: VectorSearchResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof KnowledgeBaseServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new KnowledgeBaseServiceError(
          "Network error: Unable to perform vector search"
        );
      }

      throw new KnowledgeBaseServiceError("Failed to perform vector search");
    }
  }

  async uploadContent(
    payload: UploadContentRequest
  ): Promise<UploadContentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/knowledge-base/upload`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: KnowledgeBaseErrorResponse = await response.json();
        throw new KnowledgeBaseServiceError(
          errorData?.error || "Failed to upload content",
          response.status
        );
      }

      const data: UploadContentResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof KnowledgeBaseServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new KnowledgeBaseServiceError(
          "Network error: Unable to upload content"
        );
      }

      throw new KnowledgeBaseServiceError("Failed to upload content");
    }
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
