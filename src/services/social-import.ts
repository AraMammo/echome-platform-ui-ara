import { apiClient } from "../utils/api-client";

export interface SocialImportRequest {
  platform: "youtube" | "instagram" | "facebook" | "linkedin";
  url: string;
}

export interface SocialImportResponse {
  jobId: string;
  platform: string;
  status: "INITIATED";
  message: string;
  estimatedTime: string;
}

export interface SocialImportStatus {
  jobId: string;
  userId: string;
  platform: string;
  url?: string;
  status: "INITIATED" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress?: {
    videosProcessed?: number;
    totalVideos?: number;
    postsProcessed?: number;
    totalPosts?: number;
    percentage?: number;
  };
  result?: {
    videosTranscribed?: number;
    postsProcessed?: number;
    entriesAdded?: number;
  };
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  estimatedCompletion?: string;
}

class SocialImportService {
  /**
   * Initiate social media content import
   */
  async initiateImport(
    request: SocialImportRequest
  ): Promise<SocialImportResponse> {
    console.log("🚀 Initiating social import:", request);
    console.log("API Client base URL:", process.env.NEXT_PUBLIC_BASE_URL);

    try {
      const response = await apiClient.post<SocialImportResponse>(
        "/api/social-import/scrape",
        request
      );
      console.log("✅ Social import initiated successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Social import failed:", error);
      throw error;
    }
  }

  /**
   * Get import job status
   */
  async getImportStatus(jobId: string): Promise<SocialImportStatus> {
    const response = await apiClient.get<SocialImportStatus>(
      `/api/social-import/status/${jobId}`
    );
    return response;
  }

  /**
   * Validate social media URL
   */
  validateUrl(
    platform: string,
    url: string
  ): { isValid: boolean; error?: string } {
    const urlObj = new URL(url);

    switch (platform) {
      case "youtube":
        if (
          !urlObj.hostname.includes("youtube.com") &&
          !urlObj.hostname.includes("youtu.be")
        ) {
          return { isValid: false, error: "Please enter a valid YouTube URL" };
        }
        if (
          !urlObj.pathname.includes("/@") &&
          !urlObj.pathname.includes("/channel/") &&
          !urlObj.pathname.includes("/c/")
        ) {
          return {
            isValid: false,
            error:
              "Please enter a YouTube channel URL (e.g., https://youtube.com/@channelname)",
          };
        }
        break;

      case "instagram":
        if (!urlObj.hostname.includes("instagram.com")) {
          return {
            isValid: false,
            error: "Please enter a valid Instagram URL",
          };
        }
        if (!urlObj.pathname.includes("/")) {
          return {
            isValid: false,
            error:
              "Please enter an Instagram profile URL (e.g., https://instagram.com/username)",
          };
        }
        break;

      case "facebook":
        if (!urlObj.hostname.includes("facebook.com")) {
          return { isValid: false, error: "Please enter a valid Facebook URL" };
        }
        if (!urlObj.pathname.includes("/")) {
          return {
            isValid: false,
            error:
              "Please enter a Facebook page URL (e.g., https://facebook.com/pagename)",
          };
        }
        break;

      case "linkedin":
        if (!urlObj.hostname.includes("linkedin.com")) {
          return { isValid: false, error: "Please enter a valid LinkedIn URL" };
        }
        if (!urlObj.pathname.includes("/in/")) {
          return {
            isValid: false,
            error:
              "Please enter a LinkedIn profile URL (e.g., https://linkedin.com/in/username)",
          };
        }
        break;

      default:
        return { isValid: false, error: "Unsupported platform" };
    }

    return { isValid: true };
  }

  /**
   * Get platform display name
   */
  getPlatformName(platform: string): string {
    switch (platform) {
      case "youtube":
        return "YouTube";
      case "instagram":
        return "Instagram";
      case "facebook":
        return "Facebook";
      case "linkedin":
        return "LinkedIn";
      default:
        return platform;
    }
  }

  /**
   * Get platform icon
   */
  getPlatformIcon(platform: string): string {
    switch (platform) {
      case "youtube":
        return "🎥";
      case "instagram":
        return "📸";
      case "facebook":
        return "👥";
      case "linkedin":
        return "💼";
      default:
        return "📱";
    }
  }
}

export const socialImportService = new SocialImportService();
