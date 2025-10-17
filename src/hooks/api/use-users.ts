"use client";

import { useState, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/utils/api-client";

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

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  username?: string;
  profilePicture?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface UseUsersReturn {
  getCurrentUser: () => Promise<ApiResponse<User>>;
  updateCurrentUser: (data: UpdateUserData) => Promise<ApiResponse<User>>;
  isLoading: boolean;
  error: string | null;
}

export const useUsers = (): UseUsersReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();

  const getCurrentUser = useCallback(async (): Promise<ApiResponse<User>> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.get<User>("/user");
      if (data) {
        login(data);
      }

      return {
        success: true,
        data: data,
        message: "User profile fetched successfully",
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch user profile";
      console.error("getCurrentUser - API error:", errorMessage);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const updateCurrentUser = useCallback(
    async (userData: UpdateUserData): Promise<ApiResponse<User>> => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await apiClient.put<User>("/user", userData);

        if (data) {
          login(data);
        }

        return {
          success: true,
          data: data,
          message: "Profile updated successfully",
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update user profile";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  return {
    getCurrentUser,
    updateCurrentUser,
    isLoading,
    error,
  };
};
