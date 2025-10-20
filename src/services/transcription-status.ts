export interface TranscriptionStatusResponse {
  jobId: string;
  fileId: string;
  status: string;
  languageCode: string;
  speakerIdentification: boolean;
  createdAt: string;
  updatedAt: string;
  transcribeJobName: string;
  transcribeStatus: string;
  transcriptFileUri?: string;
  transcript?: string;
  confidence?: number;
  startTime: string;
  completionTime?: string;
}

export interface TranscriptionStatusError {
  error: string;
}

export class TranscriptionStatusServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "TranscriptionStatusServiceError";
  }
}

export class TranscriptionStatusService {
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

  async getTranscriptionStatus(
    jobId: string
  ): Promise<TranscriptionStatusResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transcription/${jobId}/status`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData: TranscriptionStatusError = await response.json();
        throw new TranscriptionStatusServiceError(
          errorData?.error || "Failed to get transcription status",
          response.status
        );
      }

      const data: TranscriptionStatusResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof TranscriptionStatusServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        ((error as Error).message || "").includes("fetch")
      ) {
        throw new TranscriptionStatusServiceError(
          "Network error: Unable to get transcription status"
        );
      }

      throw new TranscriptionStatusServiceError(
        "Failed to get transcription status"
      );
    }
  }

  isTranscriptionCompleted(status: string): boolean {
    return status === "COMPLETED";
  }

  isTranscriptionInProgress(status: string): boolean {
    return status === "PENDING" || status === "IN_PROGRESS";
  }

  isTranscriptionFailed(status: string): boolean {
    return status === "FAILED" || status === "ERROR";
  }
}

export const transcriptionStatusService = new TranscriptionStatusService();
