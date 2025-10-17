import RepurposeEngineTemplate from "@/components/templates/auto-clone";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Repurpose Engine",
  description:
    "Automatically repurpose public content with EchoMe's Repurpose Engine. Discover trending content and transform it into original, engaging material for your brand.",
  openGraph: {
    title: "Repurpose Engine - EchoMe Content Discovery",
    description:
      "Automatically repurpose public content with EchoMe's Repurpose Engine. Discover trending content and transform it into original, engaging material.",
    type: "website",
  },
  twitter: {
    title: "Repurpose Engine - EchoMe Content Discovery",
    description:
      "Automatically repurpose public content with EchoMe's Repurpose Engine. Discover trending content and transform it into original, engaging material.",
  },
};

export default function RepurposeEnginePage() {
  return <RepurposeEngineTemplate />;
}
