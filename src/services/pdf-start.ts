export interface StartPdfProcessingJobRequest {
  fileId: string;
}

export interface StartPdfProcessingJobResponse {
  jobId: string;
  status: string;
  message: string;
  estimatedProcessingTime: string;
}

export interface StartPdfProcessingJobErrorResponse {
  error: string;
}

export class StartPdfProcessingJobError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "StartPdfProcessingJobError";
  }
}

export class StartPdfProcessingJobService {
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

  async startPdfProcessingJob(
    fileId: string
  ): Promise<StartPdfProcessingJobResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/pdf/start`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          fileId,
        } as StartPdfProcessingJobRequest),
      });

      if (!response.ok) {
        const errorData: StartPdfProcessingJobErrorResponse =
          await response.json();
        throw new StartPdfProcessingJobError(
          errorData?.error || "Failed to start pdf processing",
          response.status
        );
      }

      const data: StartPdfProcessingJobResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof StartPdfProcessingJobError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new StartPdfProcessingJobError(
          "Network error: Unable to start pdf processing"
        );
      }

      throw new StartPdfProcessingJobError("Failed to start pdf processing");
    }
  }
}

export const startPdfProcessingJobService = new StartPdfProcessingJobService();
