export interface EmailConnectionRequest {
  email: string;
  password: string;
  provider: "gmail" | "outlook" | "yahoo" | "imap";
  serverSettings?: {
    imapServer?: string;
    imapPort?: number;
    smtpServer?: string;
    smtpPort?: number;
    useSSL?: boolean;
  };
}

export interface EmailConnectionResponse {
  message: string;
  connectionId: string;
  status: "CONNECTED" | "FAILED";
  error?: string;
}

export interface EmailErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
}

export class EmailServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "EmailServiceError";
  }
}

export class EmailService {
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

  async connectEmail(
    payload: EmailConnectionRequest
  ): Promise<EmailConnectionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/email/connect`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: EmailErrorResponse = await response.json();
        throw new EmailServiceError(
          errorData?.error || "Failed to connect email account",
          response.status
        );
      }

      const data: EmailConnectionResponse = await response.json();
      return data;
    } catch (error: unknown) {
      if (error instanceof EmailServiceError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        (error.message || "").includes("fetch")
      ) {
        throw new EmailServiceError(
          "Network error: Unable to connect email account"
        );
      }

      throw new EmailServiceError("Failed to connect email account");
    }
  }
}

export const emailService = new EmailService();
