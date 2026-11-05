import type { Metadata } from "next";
import { StudioHome } from "@/components/studio/StudioHome";
import { getSiteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: getSiteTitle("Studio"),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <StudioHome />;
}
