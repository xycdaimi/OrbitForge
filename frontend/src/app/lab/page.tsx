import type { Metadata } from "next";
import { LabListView } from "@/components/pages/LabListView";
import { getPublishedExperiments } from "@/lib/content/experiments";
import { getSiteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: getSiteTitle("AI Lab"),
  description: "OrbitForge 实验记录与示例可视化。",
};

export default function LabPage() {
  return <LabListView experiments={getPublishedExperiments()} />;
}
