import type { Metadata } from "next";
import { satoshi } from "@/configs/fonts";
import { ToastProvider } from "@/components/atoms/toast";
import {
  OrganizationStructuredData,
  WebSiteStructuredData,
  SoftwareApplicationStructuredData,
} from "@/components/atoms/structured-data";
import { PreloadResources } from "@/components/atoms/preload-resources";
import { Analytics } from "@/components/atoms/analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EchoMe - AI Content Creation Platform",
    template: "%s | EchoMe",
  },
  description:
    "Transform your ideas into engaging content with EchoMe's AI-powered platform. Create videos, articles, and social media content effortlessly. Unmute yourself with intelligent content generation.",
  keywords: [
    "AI content creation",
    "video generation",
    "content marketing",
    "social media content",
    "AI writing",
    "content automation",
    "digital marketing",
    "content strategy",
  ],
  authors: [{ name: "EchoMe" }],
  creator: "EchoMe",
  publisher: "EchoMe",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://echome.ai",
    siteName: "EchoMe",
    title: "EchoMe - AI Content Creation Platform",
    description:
      "Transform your ideas into engaging content with EchoMe's AI-powered platform. Create videos, articles, and social media content effortlessly.",
    images: [
      {
        url: "/media/echome.png",
        width: 1200,
        height: 630,
        alt: "EchoMe - AI Content Creation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EchoMe - AI Content Creation Platform",
    description:
      "Transform your ideas into engaging content with EchoMe's AI-powered platform.",
    images: ["/media/echome.png"],
    creator: "@echome",
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
  alternates: {
    canonical: "https://echome.ai",
  },
  category: "technology",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: "#3A8E9C",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <PreloadResources />
        <OrganizationStructuredData />
        <WebSiteStructuredData />
        <SoftwareApplicationStructuredData />
      </head>
      <body className={`${satoshi.variable} font-sans antialiased`}>
        <Analytics />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
