"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/atoms/toast";

export default function YouTubeCallbackPage() {
  const router = useRouter();
  const { showToast } = useToast();

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
          showToast(
            "No OAuth data found. Please try connecting again.",
            "error"
          );

          setTimeout(() => {
            router.push("/knowledge-base");
          }, 3000);
        }
      } catch {
        showToast("YouTube connection failed. Please try again.", "error");

        setTimeout(() => {
          router.push("/knowledge-base");
        }, 3000);
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return null;
}
