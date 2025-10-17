import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule Content",
  description:
    "Schedule and manage your content publishing with EchoMe. Plan your content calendar, set posting times, and automate your content distribution across platforms.",
  openGraph: {
    title: "Schedule Content - EchoMe Publishing",
    description:
      "Schedule and manage your content publishing with EchoMe. Plan your content calendar, set posting times, and automate your content distribution.",
    type: "website",
  },
  twitter: {
    title: "Schedule Content - EchoMe Publishing",
    description:
      "Schedule and manage your content publishing with EchoMe. Plan your content calendar, set posting times, and automate your content distribution.",
  },
};

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
