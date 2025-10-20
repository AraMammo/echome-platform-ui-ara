export interface UserProfile {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  profilePicture?: string;
  profilePictureUrl?: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  currentVersion?: string;
  createdAt: string;
  updatedAt: string;
  accountDeletedAt?: string;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  profilePicture?: string | null;
}

export interface ProfilePictureUploadRequest {
  fileName: string;
  contentType: string;
}

export interface ProfilePictureUploadResponse {
  uploadUrl: string;
  fileId: string;
  key: string;
  s3Url: string;
  profilePictureUrl?: string;
}

export interface UserErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
}

export class UserServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "UserServiceError";
  }
}

export class UserService {
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

  async getUser(): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: UserErrorResponse = await response.json();
        throw new UserServiceError(
          errorData?.error || "Failed to get user profile",
          response.status
        );
      }

      const data: UserProfile = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof UserServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new UserServiceError("Network error: Unable to get user profile");
      }

      throw new UserServiceError("Failed to get user profile");
    }
  }

  async updateUser(payload: UpdateUserRequest): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: UserErrorResponse = await response.json();
        throw new UserServiceError(
          errorData?.error || "Failed to update user profile",
          response.status
        );
      }

      const data: UserProfile = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof UserServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new UserServiceError(
          "Network error: Unable to update user profile"
        );
      }

      throw new UserServiceError("Failed to update user profile");
    }
  }

  async uploadProfilePicture(
    file: File
  ): Promise<ProfilePictureUploadResponse> {
    try {
      const uploadRequest: ProfilePictureUploadRequest = {
        fileName: file.name,
        contentType: file.type,
      };

      const response = await fetch(
        `${this.baseUrl}/user/profile-picture/upload`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(uploadRequest),
        }
      );

      if (!response.ok) {
        const errorData: UserErrorResponse = await response.json();
        throw new UserServiceError(
          errorData?.error || "Failed to get upload URL",
          response.status
        );
      }

      const uploadData: ProfilePictureUploadResponse = await response.json();

      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new UserServiceError("Failed to upload file to S3");
      }

      return uploadData;
    } catch (error: unknown) {
      if (error instanceof UserServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new UserServiceError(
          "Network error: Unable to upload profile picture"
        );
      }

      throw new UserServiceError("Failed to upload profile picture");
    }
  }
}

export const userService = new UserService();
