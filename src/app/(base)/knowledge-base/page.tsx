import KnowledgeBaseRedesign from "@/components/templates/knowledge-base-redesign";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Content DNA - Knowledge Base",
  description:
    "Echo Me learns from YOUR voice, YOUR style, YOUR expertise. Upload content, connect accounts, and build your personalized content knowledge base.",
  openGraph: {
    title: "Your Content DNA - EchoMe Knowledge Base",
    description:
      "Echo Me learns from YOUR voice, YOUR style, YOUR expertise. The more you feed it, the better your content becomes.",
    type: "website",
  },
  twitter: {
    title: "Your Content DNA - EchoMe Knowledge Base",
    description:
      "Echo Me learns from YOUR voice, YOUR style, YOUR expertise. The more you feed it, the better your content becomes.",
  },
};

export default function KnowledgeBasePage() {
  return <KnowledgeBaseRedesign />;
}
