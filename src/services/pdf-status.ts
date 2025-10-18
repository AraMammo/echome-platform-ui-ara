export interface PdfStatusResponse {
  jobId: string;
  fileId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  chunkSize: number;
  errorMessage: string;
  resultsLocation: string;
  extractedText: string;
  textLength: number;
  wordCount: number;
}

export interface PdfStatusError {
  error: string;
}

export class PdfStatusServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "PdfStatusServiceError";
  }
}

export class PdfStatusService {
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

  async getPdfStatus(jobId: string): Promise<PdfStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/pdf/status/${jobId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: PdfStatusError = await response.json();
        throw new PdfStatusServiceError(
          errorData?.error || "Failed to get pdf status",
          response.status
        );
      }

      const data: PdfStatusResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof PdfStatusServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new PdfStatusServiceError(
          "Network error: Unable to get pdf status"
        );
      }

      throw new PdfStatusServiceError("Failed to get pdf status");
    }
  }

  isPdfCompleted(status: string): boolean {
    return status === "COMPLETED";
  }

  isPdfInProgress(status: string): boolean {
    return status === "PENDING" || status === "IN_PROGRESS";
  }

  isPdfFailed(status: string): boolean {
    return status === "FAILED" || status === "ERROR";
  }
}

export const pdfStatusService = new PdfStatusService();
