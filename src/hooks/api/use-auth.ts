"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { TokenManager } from "@/utils/token-manager";

interface User {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  primaryWallet?: string;
  wallets?: string[];
  portfolioId?: string;
  media?: {
    images?: {
      avatar?: string;
    };
  };
  profilePicture?: string;
  profilePictureUrl?: string;
}

interface AuthResponse {
  success: boolean;
  session?: string;
  user?: User;
  message?: string;
  tokens?: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    sub: string;
  };
}

interface UseAuthReturn {
  initiateAuth: (email: string) => Promise<AuthResponse>;
  verifyAuth: (
    email: string,
    code: string,
    session: string
  ) => Promise<AuthResponse>;
  resendVerificationCode: (
    email: string,
    session: string
  ) => Promise<AuthResponse>;
  getTokens: () => Partial<{
    accessToken: string;
    idToken: string;
    refreshToken: string;
    userId: string;
  }>;
  clearTokens: () => void;
  isAuthenticated: () => boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, syncAuthState } = useAuthStore();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    console.error("NEXT_PUBLIC_BASE_URL is not defined");
  }

  const initiateAuth = async (email: string): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/auth/initiate-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate authentication");
      }

      return {
        success: true,
        session: data.session,
        message: data.message,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAuth = async (
    email: string,
    code: string,
    session: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/auth/verify-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          otp: code,
          session,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      let parsedData = data;
      if (typeof data.body === "string") {
        try {
          parsedData = JSON.parse(data.body);
        } catch (parseError) {
          console.error("Failed to parse response body:", parseError);
          parsedData = data;
        }
      }

      if (parsedData.tokens) {
        TokenManager.setTokens({
          accessToken: parsedData.tokens.accessToken,
          idToken: parsedData.tokens.idToken,
          refreshToken: parsedData.tokens.refreshToken,
          userId: parsedData.tokens.sub,
        });
        console.log("Tokens stored in localStorage");
        syncAuthState();
      }
      const isSuccess = !!parsedData.tokens;

      if (isSuccess && parsedData.user) {
        login(parsedData.user);
        syncAuthState();
      }

      return {
        success: isSuccess,
        user: parsedData.user,
        message: parsedData.message,
        tokens: parsedData.tokens,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationCode = async (
    email: string,
    session: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/auth/resend-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          session,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification code");
      }

      return {
        success: true,
        session: data.session,
        message: data.message,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getTokens = () => {
    return TokenManager.getTokens();
  };

  const clearTokens = () => {
    TokenManager.clearTokens();
  };

  const isAuthenticated = () => {
    return TokenManager.isAuthenticated();
  };

  return {
    initiateAuth,
    verifyAuth,
    resendVerificationCode,
    getTokens,
    clearTokens,
    isAuthenticated,
    isLoading,
    error,
  };
};
