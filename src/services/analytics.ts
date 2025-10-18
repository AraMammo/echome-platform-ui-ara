export interface DashboardStats {
  totalContent: number;
  readyToPost: number;
  posted: number;
  totalViews: number;
  engagement: number;
  weeklyGrowth: number;
  contentMetrics: {
    contentType: string;
    count: number;
    percentage: number;
  }[];
  weeklyActivity: {
    date: string;
    content: number;
    views: number;
    engagement: number;
  }[];
  monthlyTrends: {
    month: string;
    content: number;
    views: number;
    engagement: number;
  }[];
  recentActivity: {
    id: string;
    action: string;
    time: string;
    status: "success" | "warning" | "error" | "info";
    icon: string;
    color: string;
  }[];
}

export interface AnalyticsErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
}

export class AnalyticsServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "AnalyticsServiceError";
  }
}

export class AnalyticsService {
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
      throw new Error("No access token available");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/dashboard`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: AnalyticsErrorResponse = await response.json();
        throw new AnalyticsServiceError(
          errorData?.error || "Failed to get dashboard stats",
          response.status
        );
      }

      const data: DashboardStats = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new AnalyticsServiceError(
          "Network error: Unable to get dashboard stats"
        );
      }

      throw new AnalyticsServiceError("Failed to get dashboard stats");
    }
  }

  async getContentMetrics(params?: {
    timeframe?: "week" | "month" | "year";
    contentType?: string;
  }): Promise<DashboardStats["contentMetrics"]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.timeframe) queryParams.append("timeframe", params.timeframe);
      if (params?.contentType)
        queryParams.append("contentType", params.contentType);

      const url = `${this.baseUrl}/analytics/content-metrics${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: AnalyticsErrorResponse = await response.json();
        throw new AnalyticsServiceError(
          errorData?.error || "Failed to get content metrics",
          response.status
        );
      }

      const data: DashboardStats["contentMetrics"] = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new AnalyticsServiceError(
          "Network error: Unable to get content metrics"
        );
      }

      throw new AnalyticsServiceError("Failed to get content metrics");
    }
  }

  async getWeeklyActivity(): Promise<DashboardStats["weeklyActivity"]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/analytics/weekly-activity`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData: AnalyticsErrorResponse = await response.json();
        throw new AnalyticsServiceError(
          errorData?.error || "Failed to get weekly activity",
          response.status
        );
      }

      const data: DashboardStats["weeklyActivity"] = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new AnalyticsServiceError(
          "Network error: Unable to get weekly activity"
        );
      }

      throw new AnalyticsServiceError("Failed to get weekly activity");
    }
  }

  async getMonthlyTrends(): Promise<DashboardStats["monthlyTrends"]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/monthly-trends`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: AnalyticsErrorResponse = await response.json();
        throw new AnalyticsServiceError(
          errorData?.error || "Failed to get monthly trends",
          response.status
        );
      }

      const data: DashboardStats["monthlyTrends"] = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new AnalyticsServiceError(
          "Network error: Unable to get monthly trends"
        );
      }

      throw new AnalyticsServiceError("Failed to get monthly trends");
    }
  }

  async getRecentActivity(): Promise<DashboardStats["recentActivity"]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/analytics/recent-activity`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData: AnalyticsErrorResponse = await response.json();
        throw new AnalyticsServiceError(
          errorData?.error || "Failed to get recent activity",
          response.status
        );
      }

      const data: DashboardStats["recentActivity"] = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new AnalyticsServiceError(
          "Network error: Unable to get recent activity"
        );
      }

      throw new AnalyticsServiceError("Failed to get recent activity");
    }
  }
}

export const analyticsService = new AnalyticsService();
