import TransformTemplate from "@/components/templates/transform";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Content",
  description:
    "Create engaging content with EchoMe's AI-powered tools. Transform videos, ideas, and knowledge into compelling content for your audience.",
  openGraph: {
    title: "Create Content - EchoMe AI Platform",
    description:
      "Create engaging content with EchoMe's AI-powered tools. Transform videos, ideas, and knowledge into compelling content.",
    type: "website",
  },
  twitter: {
    title: "Create Content - EchoMe AI Platform",
    description:
      "Create engaging content with EchoMe's AI-powered tools. Transform videos, ideas, and knowledge into compelling content.",
  },
};

export default function CreatePage() {
  return <TransformTemplate />;
}
