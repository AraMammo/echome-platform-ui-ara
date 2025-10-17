import KnowledgeBaseTemplate from "@/components/templates/knowledge-base";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Base",
  description:
    "Build and manage your content knowledge base with EchoMe. Organize ideas, research, and insights to fuel your content creation strategy.",
  openGraph: {
    title: "Knowledge Base - EchoMe Content Management",
    description:
      "Build and manage your content knowledge base with EchoMe. Organize ideas, research, and insights to fuel your content creation.",
    type: "website",
  },
  twitter: {
    title: "Knowledge Base - EchoMe Content Management",
    description:
      "Build and manage your content knowledge base with EchoMe. Organize ideas, research, and insights to fuel your content creation.",
  },
};

export default function KnowledgeBasePage() {
  return <KnowledgeBaseTemplate />;
}
