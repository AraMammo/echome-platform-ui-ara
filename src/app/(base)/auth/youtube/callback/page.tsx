"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/atoms/toast";

export default function YouTubeCallbackPage() {
  const router = useRouter();
  const { success, error } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");

        if (code && state) {
          localStorage.setItem("youtube_oauth_code", code);
          localStorage.setItem("youtube_oauth_state", state);

          router.push("/knowledge-base");
        } else {
          error("No OAuth data found. Please try connecting again.");

          setTimeout(() => {
            router.push("/knowledge-base");
          }, 3000);
        }
      } catch (err) {
        console.error("YouTube callback error:", err);
        error("YouTube connection failed. Please try again.");

        setTimeout(() => {
          router.push("/knowledge-base");
        }, 3000);
      }
    };

    handleCallback();
  }, [router, success, error]);

  return null;
}
