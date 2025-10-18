export interface PineconeHealthResponse {
  status: "healthy" | "unhealthy";
  message: string;
  timestamp: string;
}

export interface VectorUpsertRequest {
  vectors: VectorData[];
  namespace?: string;
}

export interface VectorData {
  id: string;
  values: number[];
  metadata?: Record<string, string | number | boolean | string[]>;
}

export interface VectorUpsertResponse {
  upsertedCount: number;
  message: string;
}

export interface VectorQueryRequest {
  vector: number[];
  topK?: number;
  includeMetadata?: boolean;
  includeValues?: boolean;
  filter?: Record<string, string | number | boolean | string[]>;
  namespace?: string;
}

export interface VectorQueryResult {
  id: string;
  score: number;
  values?: number[];
  metadata?: Record<string, string | number | boolean | string[]>;
}

export interface VectorQueryResponse {
  matches: VectorQueryResult[];
  namespace: string;
}

export interface VectorDeleteRequest {
  ids: string[];
  namespace?: string;
}

export interface VectorDeleteResponse {
  deletedCount: number;
  message: string;
}

export interface PineconeErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
}

export class PineconeServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "PineconeServiceError";
  }
}

export class PineconeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    if (!this.baseUrl) {
      console.warn("API base URL is not configured (NEXT_PUBLIC_BASE_URL) - API calls will not work");
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

  async checkHealth(): Promise<PineconeHealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/pinecone/health`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: PineconeErrorResponse = await response.json();
        throw new PineconeServiceError(
          errorData?.error || "Failed to check Pinecone health",
          response.status
        );
      }

      const data: PineconeHealthResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof PineconeServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new PineconeServiceError(
          "Network error: Unable to check Pinecone health"
        );
      }

      throw new PineconeServiceError("Failed to check Pinecone health");
    }
  }

  async upsertVectors(
    payload: VectorUpsertRequest
  ): Promise<VectorUpsertResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/pinecone/vectors`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: PineconeErrorResponse = await response.json();
        throw new PineconeServiceError(
          errorData?.error || "Failed to upsert vectors",
          response.status
        );
      }

      const data: VectorUpsertResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof PineconeServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new PineconeServiceError(
          "Network error: Unable to upsert vectors"
        );
      }

      throw new PineconeServiceError("Failed to upsert vectors");
    }
  }

  async queryVectors(
    payload: VectorQueryRequest
  ): Promise<VectorQueryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/pinecone/vectors/query`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: PineconeErrorResponse = await response.json();
        throw new PineconeServiceError(
          errorData?.error || "Failed to query vectors",
          response.status
        );
      }

      const data: VectorQueryResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof PineconeServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new PineconeServiceError(
          "Network error: Unable to query vectors"
        );
      }

      throw new PineconeServiceError("Failed to query vectors");
    }
  }

  async deleteVectors(
    payload: VectorDeleteRequest
  ): Promise<VectorDeleteResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/pinecone/vectors`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: PineconeErrorResponse = await response.json();
        throw new PineconeServiceError(
          errorData?.error || "Failed to delete vectors",
          response.status
        );
      }

      const data: VectorDeleteResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof PineconeServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new PineconeServiceError(
          "Network error: Unable to delete vectors"
        );
      }

      throw new PineconeServiceError("Failed to delete vectors");
    }
  }
}

export const pineconeService = new PineconeService();
