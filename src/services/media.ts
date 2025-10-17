export interface MediaFile {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  metadata?: {
    duration?: number;
    dimensions?: {
      width: number;
      height: number;
    };
    format?: string;
  };
}

export interface MediaFilesResponse {
  data: MediaFile[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface MediaFileMetadata extends MediaFile {
  processingStatus: string;
  extractedData?: Record<string, unknown>;
  thumbnails?: string[];
  previewUrl?: string;
}

export interface MediaTransformRequest {
  fileId: string;
  transformations: {
    resize?: {
      width?: number;
      height?: number;
      maintainAspectRatio?: boolean;
    };
    convert?: {
      format: "jpeg" | "png" | "webp" | "mp4" | "webm";
      quality?: number;
    };
    thumbnail?: {
      width: number;
      height: number;
      format?: "jpeg" | "png" | "webp";
    };
    watermark?: {
      text?: string;
      imageUrl?: string;
      position?:
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right"
        | "center";
      opacity?: number;
    };
  };
}

export interface MediaTransformResponse {
  jobId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  message: string;
}

export interface MediaErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
}

export class MediaServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "MediaServiceError";
  }
}

export class MediaService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    if (!this.baseUrl) {
      throw new Error("API base URL is not configured (NEXT_PUBLIC_BASE_URL)");
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("MediaService - No access token available");
      throw new Error("No access token available");
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        console.error("MediaService - Token is expired");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("idToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        throw new Error("Authentication token has expired");
      }
    } catch (error) {
      console.error("MediaService - Error validating token:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("idToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      throw new Error("Invalid authentication token");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getFiles(params?: {
    contentType?: string;
    limit?: number;
    offset?: number;
  }): Promise<MediaFilesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.contentType)
        queryParams.append("contentType", params.contentType);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const url = `${this.baseUrl}/media/files${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: MediaErrorResponse = await response.json();
        throw new MediaServiceError(
          errorData?.error || "Failed to get media files",
          response.status
        );
      }

      const data: MediaFilesResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof MediaServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new MediaServiceError("Network error: Unable to get media files");
      }

      throw new MediaServiceError("Failed to get media files");
    }
  }

  async getFileMetadata(fileId: string): Promise<MediaFileMetadata> {
    try {
      const response = await fetch(
        `${this.baseUrl}/media/files/${fileId}/metadata`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData: MediaErrorResponse = await response.json();
        throw new MediaServiceError(
          errorData?.error || "Failed to get file metadata",
          response.status
        );
      }

      const data: MediaFileMetadata = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof MediaServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new MediaServiceError(
          "Network error: Unable to get file metadata"
        );
      }

      throw new MediaServiceError("Failed to get file metadata");
    }
  }

  async transformMedia(
    payload: MediaTransformRequest
  ): Promise<MediaTransformResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/media/transform`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: MediaErrorResponse = await response.json();
        throw new MediaServiceError(
          errorData?.error || "Failed to transform media",
          response.status
        );
      }

      const data: MediaTransformResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof MediaServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new MediaServiceError("Network error: Unable to transform media");
      }

      throw new MediaServiceError("Failed to transform media");
    }
  }
}

export const mediaService = new MediaService();
