export interface Schedule {
  scheduleId: string;
  userId: string;
  contentId: string;
  scheduledTime: string;
  platform: string;
  status: "scheduled" | "ready" | "posted" | "cancelled" | "failed";
  createdAt: string;
  updatedAt: string;
  metadata?: {
    title?: string;
    contentType?: string;
    platformAccount?: string;
  };
}

export interface CreateScheduleRequest {
  contentId: string;
  scheduledTime: string;
  platform: string;
  status?: "scheduled" | "ready" | "posted" | "cancelled" | "failed";
  metadata?: {
    title?: string;
    contentType?: string;
    platformAccount?: string;
  };
}

export interface UpdateScheduleRequest {
  scheduledTime?: string;
  platform?: string;
  status?: "scheduled" | "ready" | "posted" | "cancelled" | "failed";
  metadata?: {
    title?: string;
    contentType?: string;
    platformAccount?: string;
  };
}

export interface GetSchedulesParams {
  status?: string;
  platform?: string;
  limit?: number;
  offset?: number;
}

export interface SchedulesResponse {
  schedules: Schedule[];
  total: number;
  hasMore: boolean;
}

export interface SchedulingErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
}

export class SchedulingServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "SchedulingServiceError";
  }
}

export class SchedulingService {
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
      throw new Error("No access token available");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async createSchedule(request: CreateScheduleRequest): Promise<Schedule> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduling/schedules`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData: SchedulingErrorResponse = await response.json();
        throw new SchedulingServiceError(
          errorData?.error || "Failed to create schedule",
          response.status
        );
      }

      const data: Schedule = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof SchedulingServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new SchedulingServiceError(
          "Network error: Unable to create schedule"
        );
      }

      throw new SchedulingServiceError("Failed to create schedule");
    }
  }

  async getSchedules(params?: GetSchedulesParams): Promise<SchedulesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.platform) queryParams.append("platform", params.platform);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const url = `${this.baseUrl}/scheduling/schedules${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: SchedulingErrorResponse = await response.json();
        throw new SchedulingServiceError(
          errorData?.error || "Failed to get schedules",
          response.status
        );
      }

      const data: SchedulesResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof SchedulingServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new SchedulingServiceError(
          "Network error: Unable to get schedules"
        );
      }

      throw new SchedulingServiceError("Failed to get schedules");
    }
  }

  async updateSchedule(
    scheduleId: string,
    request: UpdateScheduleRequest
  ): Promise<Schedule> {
    try {
      const response = await fetch(
        `${this.baseUrl}/scheduling/schedules/${scheduleId}`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData: SchedulingErrorResponse = await response.json();
        throw new SchedulingServiceError(
          errorData?.error || "Failed to update schedule",
          response.status
        );
      }

      const data: Schedule = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof SchedulingServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new SchedulingServiceError(
          "Network error: Unable to update schedule"
        );
      }

      throw new SchedulingServiceError("Failed to update schedule");
    }
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/scheduling/schedules/${scheduleId}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData: SchedulingErrorResponse = await response.json();
        throw new SchedulingServiceError(
          errorData?.error || "Failed to delete schedule",
          response.status
        );
      }
    } catch (error: unknown) {
      if (error instanceof SchedulingServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new SchedulingServiceError(
          "Network error: Unable to delete schedule"
        );
      }

      throw new SchedulingServiceError("Failed to delete schedule");
    }
  }
}

export const schedulingService = new SchedulingService();
