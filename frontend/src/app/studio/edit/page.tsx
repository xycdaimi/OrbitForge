import type { Metadata } from "next";
import { StudioEditorPage } from "@/components/studio/StudioEditorPage";
import { getSiteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: getSiteTitle("Edit"),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <StudioEditorPage />;
}
