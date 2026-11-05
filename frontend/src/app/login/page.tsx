import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/LoginPage";
import { getSiteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: getSiteTitle("Login"),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LoginPage />;
}
