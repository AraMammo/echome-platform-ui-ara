export interface FileUploadUrlRequest {
  fileName: string;
  contentType: string;
}

export interface FileUploadUrlResponse {
  uploadUrl: string;
  fileId: string;
  key: string;
}

export interface FileDownloadUrlResponse {
  downloadUrl: string;
  fileName: string;
  contentType: string;
}

export interface FileErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
}

export class FileUploadServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "FileUploadServiceError";
  }
}

export class FileUploadService {
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
      throw new Error("No authentication token found");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getUploadUrl(
    fileName: string,
    contentType: string
  ): Promise<FileUploadUrlResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/files/upload-url`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          fileName,
          contentType,
        } as FileUploadUrlRequest),
      });

      if (!response.ok) {
        const errorData: FileErrorResponse = await response.json();
        throw new FileUploadServiceError(
          errorData?.error || "Failed to get upload URL",
          response.status
        );
      }

      const data: FileUploadUrlResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof FileUploadServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new FileUploadServiceError(
          "Network error: Unable to connect to server"
        );
      }

      throw new FileUploadServiceError("Failed to get upload URL");
    }
  }

  async getDownloadUrl(fileId: string): Promise<FileDownloadUrlResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/files/${fileId}/download-url`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData: FileErrorResponse = await response.json();
        throw new FileUploadServiceError(
          errorData?.error || "Failed to get download URL",
          response.status
        );
      }

      const data: FileDownloadUrlResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof FileUploadServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new FileUploadServiceError(
          "Network error: Unable to get download URL"
        );
      }

      throw new FileUploadServiceError("Failed to get download URL");
    }
  }
}

export const fileUploadService = new FileUploadService();
