"use client";

import { useAuthStore } from "@/stores/auth-store";
import { TokenManager } from "@/utils/token-manager";
import { useEffect, useState } from "react";

export default function DebugAuth() {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [tokens, setTokens] = useState<{
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    userId?: string;
  } | null>(null);
  const [apiTest, setApiTest] = useState<{
    status?: number;
    result?: unknown;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const tokens = TokenManager.getTokens();
    setTokens(tokens);
  }, []);

  const testAPI = async () => {
    try {
      console.log("🔍 Testing API call...");
      console.log("Base URL:", process.env.NEXT_PUBLIC_BASE_URL);
      console.log("Token:", tokens?.accessToken ? "Present" : "Missing");

      // Test the actual social import API
      const response = await fetch(
        "https://ptjyo06xqg.execute-api.us-east-1.amazonaws.com/api/social-import/scrape",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens?.accessToken || ""}`,
          },
          body: JSON.stringify({
            platform: "youtube",
            url: "https://youtube.com/@test",
          }),
        }
      );

      const result = await response.text();
      console.log("API Response:", { status: response.status, result });
      setApiTest({ status: response.status, result: result });
    } catch (error) {
      console.error("API Error:", error);
      setApiTest({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-4">Debug Authentication</h3>

      <div className="space-y-2">
        <p>
          <strong>Is Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
        </p>
        <p>
          <strong>Is Loading:</strong> {isLoading ? "Yes" : "No"}
        </p>
        <p>
          <strong>User ID:</strong> {user?.id || "None"}
        </p>
        <p>
          <strong>Access Token:</strong>{" "}
          {tokens?.accessToken ? "Present" : "Missing"}
        </p>
        <p>
          <strong>Token Length:</strong> {tokens?.accessToken?.length || 0}
        </p>
        <p>
          <strong>API Base URL:</strong>{" "}
          {process.env.NEXT_PUBLIC_BASE_URL || "Not set"}
        </p>
        <p>
          <strong>Token Preview:</strong>{" "}
          {tokens?.accessToken
            ? `${tokens.accessToken.substring(0, 20)}...`
            : "None"}
        </p>
      </div>

      <button
        onClick={testAPI}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test API Call
      </button>

      {apiTest && (
        <div className="mt-4 p-2 bg-white rounded">
          <h4>API Test Result:</h4>
          <pre>{JSON.stringify(apiTest, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
