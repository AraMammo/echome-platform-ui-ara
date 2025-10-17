import { Metadata } from "next";

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title = "EchoMe - AI Content Creation Platform",
    description = "Transform your ideas into engaging content with EchoMe's AI-powered platform. Create videos, articles, and social media content effortlessly.",
    keywords = [],
    image = "/media/echome.png",
    url = "https://echome.ai",
    type = "website",
    publishedTime,
    modifiedTime,
    authors = ["EchoMe"],
  } = config;

  const baseKeywords = [
    "AI content creation",
    "video generation",
    "content marketing",
    "social media content",
    "AI writing",
    "content automation",
    "digital marketing",
    "content strategy",
  ];

  const allKeywords = [...baseKeywords, ...keywords];

  const metadata: Metadata = {
    title,
    description,
    keywords: allKeywords,
    authors: authors.map((author) => ({ name: author })),
    openGraph: {
      title,
      description,
      type,
      url,
      siteName: "EchoMe",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@echome",
    },
    alternates: {
      canonical: url,
    },
  };

  return metadata;
}

export const seoConfig = {
  defaultTitle: "EchoMe - AI Content Creation Platform",
  defaultDescription:
    "Transform your ideas into engaging content with EchoMe's AI-powered platform. Create videos, articles, and social media content effortlessly.",
  siteUrl: "https://echome.ai",
  defaultImage: "/media/echome.png",
  twitterHandle: "@echome",
  organizationName: "EchoMe",
};
