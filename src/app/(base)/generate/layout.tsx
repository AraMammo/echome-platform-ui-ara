import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generate Content",
  description:
    "Create AI-powered content in your voice with EchoMe's unified generation flow. Choose your source, define your audience, and generate content across multiple formats instantly.",
  openGraph: {
    title: "Generate Content - EchoMe AI Platform",
    description:
      "Create AI-powered content in your voice. Generate blog posts, social media content, newsletters, and more from any source material.",
    type: "website",
  },
  twitter: {
    title: "Generate Content - EchoMe AI Platform",
    description:
      "Create AI-powered content in your voice. Generate blog posts, social media content, newsletters, and more from any source material.",
  },
};

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
