import TransformTemplate from "@/components/templates/transform";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transform Content",
  description:
    "Transform your existing content with EchoMe's AI-powered tools. Repurpose videos, articles, and media into fresh, engaging content for different platforms.",
  openGraph: {
    title: "Transform Content - EchoMe AI Platform",
    description:
      "Transform your existing content with EchoMe's AI-powered tools. Repurpose videos, articles, and media into fresh, engaging content.",
    type: "website",
  },
  twitter: {
    title: "Transform Content - EchoMe AI Platform",
    description:
      "Transform your existing content with EchoMe's AI-powered tools. Repurpose videos, articles, and media into fresh, engaging content.",
  },
};

export default function TransformPage() {
  return <TransformTemplate />;
}
