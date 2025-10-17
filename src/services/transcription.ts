export interface TranscriptionStartRequest {
  fileId: string;
}

export interface TranscriptionStartResponse {
  jobId: string;
  status: string;
  message: string;
  transcribeJobName: string;
}

import { TranscriptionJobsResponse } from "./database-content";

export interface TranscriptionServiceErrorResponse {
  error: string;
}

export class TranscriptionServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "TranscriptionServiceError";
  }
}

export class TranscriptionService {
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
      throw new Error("No authentication token found");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async startTranscription(
    fileId: string
  ): Promise<TranscriptionStartResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transcription/start`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          fileId,
        } as TranscriptionStartRequest),
      });

      if (!response.ok) {
        const errorData: TranscriptionServiceErrorResponse =
          await response.json();
        throw new TranscriptionServiceError(
          errorData?.error || "Failed to start transcription",
          response.status
        );
      }

      const data: TranscriptionStartResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof TranscriptionServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new TranscriptionServiceError(
          "Network error: Unable to start transcription"
        );
      }

      throw new TranscriptionServiceError("Failed to start transcription");
    }
  }

  async getTranscriptionJobs(params?: {
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

      const url = `${this.baseUrl}/transcription/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: TranscriptionServiceErrorResponse =
          await response.json();
        throw new TranscriptionServiceError(
          errorData?.error || "Failed to get transcription jobs",
          response.status
        );
      }

      const data: TranscriptionJobsResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof TranscriptionServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new TranscriptionServiceError(
          "Network error: Unable to get transcription jobs"
        );
      }

      throw new TranscriptionServiceError("Failed to get transcription jobs");
    }
  }

  async deleteTranscriptionJob(jobId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transcription/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData: TranscriptionServiceErrorResponse =
          await response.json();
        throw new TranscriptionServiceError(
          errorData?.error || "Failed to delete transcription job",
          response.status
        );
      }

      const data: { message: string } = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof TranscriptionServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new TranscriptionServiceError(
          "Network error: Unable to delete transcription job"
        );
      }

      throw new TranscriptionServiceError("Failed to delete transcription job");
    }
  }

  isTranscriptionSupported(fileType: string): boolean {
    const audioTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/mp4",
      "audio/aac",
      "audio/ogg",
      "audio/flac",
      "audio/webm",
    ];

    const videoTypes = [
      "video/mp4",
      "video/quicktime",
      "video/avi",
      "video/webm",
      "video/mpeg",
      "video/x-msvideo",
      "video/x-ms-wmv",
      "video/x-flv",
      "video/3gpp",
      "video/x-matroska",
    ];

    const pdfTypes = ["application/pdf"];

    return (
      audioTypes.includes(fileType) ||
      videoTypes.includes(fileType) ||
      pdfTypes.includes(fileType)
    );
  }
}

export const transcriptionService = new TranscriptionService();
