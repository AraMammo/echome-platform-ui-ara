import React from "react";

interface OrganizationStructuredDataProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

interface WebSiteStructuredDataProps {
  name?: string;
  url?: string;
  description?: string;
  potentialAction?: {
    "@type": string;
    target: string;
    "query-input": string;
  };
}

interface WebPageStructuredDataProps {
  name?: string;
  url?: string;
  description?: string;
  mainEntity?: {
    "@type": string;
    name: string;
  };
}

export function OrganizationStructuredData({
  name = "EchoMe",
  url = "https://echome.ai",
  logo = "https://echome.ai/media/echome.png",
  description = "AI-powered content creation platform that transforms ideas into engaging content",
  sameAs = [
    "https://twitter.com/echome",
    "https://linkedin.com/company/echome",
  ],
}: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function WebSiteStructuredData({
  name = "EchoMe",
  url = "https://echome.ai",
  description = "AI-powered content creation platform",
  potentialAction,
}: WebSiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: potentialAction || {
      "@type": "SearchAction",
      target: `${url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function WebPageStructuredData({
  name,
  url,
  description,
  mainEntity,
}: WebPageStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url,
    description,
    mainEntity: mainEntity || {
      "@type": "SoftwareApplication",
      name: "EchoMe",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function SoftwareApplicationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EchoMe",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    description:
      "AI-powered content creation platform that transforms ideas into engaging content for videos, articles, and social media",
    url: "https://echome.ai",
    author: {
      "@type": "Organization",
      name: "EchoMe",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
    features: [
      "AI Content Generation",
      "Video Transformation",
      "Content Scheduling",
      "Knowledge Base Management",
      "Analytics Dashboard",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
