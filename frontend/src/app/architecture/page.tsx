import type { Metadata } from "next";
import { ArchitectureListView } from "@/components/pages/ArchitectureListView";
import { getPublishedArchitecture } from "@/lib/content/architecture";
import { getSiteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: getSiteTitle("Architecture"),
  description: "OrbitForge 架构设计与部署边界说明。",
};

export default function ArchitecturePage() {
  return <ArchitectureListView items={getPublishedArchitecture()} />;
}
