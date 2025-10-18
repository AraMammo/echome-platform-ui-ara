export interface GetContentGenerationResponse {
  jobId: string;
  status: string;
  outputFormat: string;
  topic: string;
  maxLength: number;
  tone: string;
  includeHashtags: boolean;
  createdAt: string;
  updatedAt: string;
  requestId: string;
  timestamp: string;
  generatedContent: {
    contentId: string;
    content: string;
    outputFormat: string;
    topic: string;
    tone: string;
    includeHashtags: boolean;
    retrievedExamplesCount: number;
    createdAt: string;
  };
}

export interface GetContentGenerationErrorResponse {
  error: string;
}

export class GetContentGenerationError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "GetContentGenerationError";
  }
}

export class GetContentGenerationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    if (!this.baseUrl) {
      console.warn("API base URL is not configured (NEXT_PUBLIC_BASE_URL) - API calls will not work");
    }
  }

  async getContentGenerationStatus(
    jobId: string
  ): Promise<GetContentGenerationResponse> {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        `${this.baseUrl}/content/generation/${jobId}/status`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        }
      );

      if (!response.ok) {
        const errorData: GetContentGenerationErrorResponse =
          await response.json();
        throw new GetContentGenerationError(
          errorData?.error || "Failed to get content generation status",
          response.status
        );
      }

      const data: GetContentGenerationResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof GetContentGenerationError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new GetContentGenerationError(
          "Network error: Unable to get content generation status"
        );
      }

      throw new GetContentGenerationError(
        "Failed to get content generation status"
      );
    }
  }
}

export const getContentGenerationService = new GetContentGenerationService();
