import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Library",
  description:
    "Browse and manage your generated content kits. Download, view, and organize all your AI-generated content from one central library.",
  openGraph: {
    title: "Content Library - EchoMe AI Platform",
    description:
      "Browse and manage your generated content kits. Access all your AI-generated blog posts, social media content, and more.",
    type: "website",
  },
  twitter: {
    title: "Content Library - EchoMe AI Platform",
    description:
      "Browse and manage your generated content kits. Access all your AI-generated blog posts, social media content, and more.",
  },
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
