import type { Metadata } from "next";
import { AboutPageView } from "@/components/pages/AboutPageView";
import { getSiteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: getSiteTitle("About"),
  description: "关于 OrbitForge 星轨实验室。",
};

export default function AboutPage() {
  return <AboutPageView />;
}
