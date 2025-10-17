"use client";

import { useEffect } from "react";
import { Button } from "@/components/atoms/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#1c1c1e] font-['Satoshi']">
            Something went wrong
          </h1>
          <p className="text-[#9b8baf] font-['Satoshi']">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-[#3a8e9c] hover:bg-[#2d7a85] text-white font-medium font-['Satoshi'] px-6 py-3 rounded-[12px] transition-colors"
          >
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-[#d5d2cc] text-[#1c1c1e] hover:shadow-md hover:border-[#3a8e9c] transition-all font-['Satoshi'] px-6 py-3 rounded-[12px]"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
