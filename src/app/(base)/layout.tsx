import { Layout } from "@/components/organisms/layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | EchoMe",
  },
  description:
    "Manage and track your EchoMe content ecosystem. View analytics, create new content, and monitor your content performance all in one place.",
};

export default function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Layout>{children}</Layout>;
}
