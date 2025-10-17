import { apiClient } from "../utils/api-client";

export interface ConnectedAccount {
  platform: "twitter" | "linkedin" | "facebook" | "instagram";
  profileId: string;
  profileName: string;
  connectedAt: string;
  isExpired: boolean;
  expiresAt: string | null;
}

export interface GetConnectedAccountsResponse {
  connectedAccounts: ConnectedAccount[];
  totalCount: number;
}

export interface OAuthInitResponse {
  authUrl: string;
  platform: string;
}

export interface PostToSocialRequest {
  text: string;
  mediaUrls?: string[];
  isThread?: boolean; // For Twitter
  visibility?: "PUBLIC" | "CONNECTIONS"; // For LinkedIn
  platform?: "facebook" | "instagram"; // For Meta
  scheduledTime?: string; // ISO 8601 string
}

export interface PostToSocialResponse {
  success: boolean;
  platform: string;
  postId?: string;
  tweetId?: string;
  threadId?: string;
  tweetCount?: number;
  activityUrn?: string;
}

class OAuthService {
  /**
   * Get all connected social media accounts for the current user
   */
  async getConnectedAccounts(): Promise<GetConnectedAccountsResponse> {
    const response =
      await apiClient.get<GetConnectedAccountsResponse>("/oauth/accounts");
    return response;
  }

  /**
   * Initiate OAuth flow for Twitter
   */
  async connectTwitter(): Promise<void> {
    const response = await apiClient.get<OAuthInitResponse>(
      "/oauth/twitter/init"
    );
    // Redirect user to Twitter authorization page
    window.location.href = response.authUrl;
  }

  /**
   * Initiate OAuth flow for LinkedIn
   */
  async connectLinkedIn(): Promise<void> {
    const response = await apiClient.get<OAuthInitResponse>(
      "/oauth/linkedin/init"
    );
    // Redirect user to LinkedIn authorization page
    window.location.href = response.authUrl;
  }

  /**
   * Initiate OAuth flow for Meta (Facebook/Instagram)
   */
  async connectMeta(): Promise<void> {
    const response = await apiClient.get<OAuthInitResponse>("/oauth/meta/init");
    // Redirect user to Meta authorization page
    window.location.href = response.authUrl;
  }

  /**
   * Disconnect a social media account
   */
  async disconnectAccount(
    platform: ConnectedAccount["platform"]
  ): Promise<void> {
    await apiClient.delete(`/oauth/accounts/${platform}`);
  }

  /**
   * Post to Twitter
   */
  async postToTwitter(
    request: PostToSocialRequest
  ): Promise<PostToSocialResponse> {
    const response = await apiClient.post<PostToSocialResponse>(
      "/social/post/twitter",
      request
    );
    return response;
  }

  /**
   * Post to LinkedIn
   */
  async postToLinkedIn(
    request: PostToSocialRequest
  ): Promise<PostToSocialResponse> {
    const response = await apiClient.post<PostToSocialResponse>(
      "/social/post/linkedin",
      request
    );
    return response;
  }

  /**
   * Post to Meta (Facebook/Instagram)
   */
  async postToMeta(
    request: PostToSocialRequest
  ): Promise<PostToSocialResponse> {
    const response = await apiClient.post<PostToSocialResponse>(
      "/social/post/meta",
      request
    );
    return response;
  }
}

export const oauthService = new OAuthService();
