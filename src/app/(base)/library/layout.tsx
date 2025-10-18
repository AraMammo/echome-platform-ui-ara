import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Kits",
  description:
    "Your AI-generated content library. Browse, manage, and download your content kits featuring blog posts, social media content, video scripts, and more.",
  openGraph: {
    title: "Content Kits - EchoMe AI Platform",
    description:
      "Your AI-generated content library. Browse, manage, and download your content kits featuring blog posts, social media content, video scripts, and more.",
    type: "website",
  },
  twitter: {
    title: "Content Kits - EchoMe AI Platform",
    description:
      "Your AI-generated content library. Browse, manage, and download your content kits featuring blog posts, social media content, video scripts, and more.",
  },
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
