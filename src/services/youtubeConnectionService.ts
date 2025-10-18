export interface youtubeConnectionPayload {
  state?: string;
}

export interface youtubeConnectionResponse {
  authUrl: string;
  state: string;
  connectionId: string;
}

export interface youtubeConnectCallbackPayload {
  code: string;
  state: string;
}

export interface youtubeConnectCallbackResponse {
  success: string;
  connectionId: string;
  channelId: string;
  channelTitle: string;
  message: string;
}

export interface syncVideoPayload {
  connectionId: string;
  maxResults: number;
}
export interface syncVideoResponse {
  success: boolean;
  videosProcessed: number;
  videosAdded: number;
  videosUpdated: number;
  transcriptsProcessed: number;
  embeddingsGenerated: number;
  message: string;
}

export interface userVideo {
  privacyStatus: string;
  createdAt: string;
  likeCount: number;
  language: string;
  transcriptStatus: string;
  commentCount: number;
  viewCount: number;
  channelId: string;
  embeddingStatus: string;
  publishedAt: string;
  userId: string;
  categoryId: string;
  updatedAt: string;
  channelTitle: string;
  thumbnail: string;
  description: string;
  duration: string;
  tags: string[];
  title: string;
  videoId: string;
}

export interface userVideoResponse {
  videos: userVideo[];
  totalResults: number;
}

export interface youtubeConnectionState {
  authUrl: string;
  state: string;
  connectionId: string;
  connectionData?: youtubeConnectCallbackResponse;
  isLoading: boolean;
  isConnecting: boolean;
  error?: string;
}

export interface youtubeConnectionErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
}

export class YoutubeServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "YoutubeServiceError";
  }
}

export class YoutubeConnectionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    if (!this.baseUrl) {
      console.warn("API base URL is not configured (NEXT_PUBLIC_BASE_URL) - API calls will not work");
    }
  }

  async youtubeConnection(
    payload: youtubeConnectionPayload
  ): Promise<youtubeConnectionResponse> {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(`${this.baseUrl}/youtube/connect/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: youtubeConnectionErrorResponse = await response.json();
        throw new YoutubeServiceError(
          errorData?.error || "Failed to get youtube connect",
          response.status
        );
      }

      const data: youtubeConnectionResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof YoutubeServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new YoutubeServiceError(
          "Network error: Unable to get youtube connect"
        );
      }

      throw new YoutubeServiceError("Failed to get youtube connect");
    }
  }

  async youtubeConnectCallback(params?: {
    code?: string;
    state?: string;
  }): Promise<youtubeConnectCallbackResponse> {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const url = `${this.baseUrl}/youtube/connect/callback`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData: youtubeConnectionErrorResponse = await response.json();
        throw new YoutubeServiceError(
          errorData?.error || "Failed to get youtube connect callback",
          response.status
        );
      }

      const data: youtubeConnectCallbackResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof YoutubeServiceError) {
        throw error;
      }
      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new YoutubeServiceError(
          "Network error: Unable to get youtube connect callback"
        );
      }

      throw new YoutubeServiceError("Failed to get youtube connect callback");
    }
  }

  async syncVideo(params: syncVideoPayload): Promise<syncVideoResponse> {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const url = `${this.baseUrl}/youtube/videos/sync`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData: youtubeConnectionErrorResponse = await response.json();
        throw new YoutubeServiceError(
          errorData?.error || "Failed to sync youtube videos",
          response.status
        );
      }

      const data: syncVideoResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof YoutubeServiceError) {
        throw error;
      }
      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new YoutubeServiceError(
          "Network error: Unable to sync youtube videos"
        );
      }

      throw new YoutubeServiceError("Failed to sync youtube videos");
    }
  }

  async youtubeUserVideos(params?: {
    pageToken?: number;
    maxResults?: number;
  }): Promise<userVideoResponse> {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const queryParams = new URLSearchParams();
      if (params?.pageToken !== undefined) {
        queryParams.append("pageToken", params.pageToken.toString());
      }
      if (params?.maxResults !== undefined) {
        queryParams.append("maxResults", params.maxResults.toString());
      }

      const url = `${this.baseUrl}/youtube/videos${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const errorData: youtubeConnectionErrorResponse = await response.json();
        throw new YoutubeServiceError(
          errorData?.error || "Failed to get youtube user videos",
          response.status
        );
      }

      const data: userVideoResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof YoutubeServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new YoutubeServiceError(
          "Network error: Unable to get youtube user videos"
        );
      }

      throw new YoutubeServiceError("Failed to get youtube user videos");
    }
  }

  extractCodeFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("code");
    } catch (error) {
      console.error("Error extracting code from URL:", error);
      return null;
    }
  }

  isCallbackUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.pathname.includes("/auth/youtube/callback") &&
        urlObj.searchParams.has("code")
      );
    } catch {
      return false;
    }
  }

  async completeConnectionFlow(
    setState: (
      updater: (prev: youtubeConnectionState) => youtubeConnectionState
    ) => void,
    onSuccess?: (data: youtubeConnectCallbackResponse) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

      const initResponse = await this.youtubeConnection({
        state: "optional-state-parameter",
      });

      setState((prev) => ({
        ...prev,
        authUrl: initResponse.authUrl,
        state: initResponse.state,
        connectionId: initResponse.connectionId,
        isLoading: false,
      }));

      window.location.href = initResponse.authUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Connection failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isConnecting: false,
        error: errorMessage,
      }));
      onError?.(errorMessage);
    }
  }

  async handleRedirectCallback(): Promise<youtubeConnectCallbackResponse> {
    try {
      const code = this.extractCodeFromUrl(window.location.href);
      const state = new URLSearchParams(window.location.search).get("state");

      if (!code) {
        throw new Error("No authorization code found in URL");
      }

      if (!state) {
        throw new Error("No state parameter found in URL");
      }

      const callbackResponse = await this.youtubeConnectCallback({
        code,
        state,
      });

      return callbackResponse;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Callback failed";
      throw new YoutubeServiceError(errorMessage);
    }
  }
}

export const youtubeConnectionService = new YoutubeConnectionService();
