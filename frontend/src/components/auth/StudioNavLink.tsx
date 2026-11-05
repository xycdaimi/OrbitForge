"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readAuthorToken } from "@/components/auth/LoginPage";

export function StudioNavLink() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(readAuthorToken().length > 0);
  }, []);

  if (!authed) {
    return null;
  }

  return (
    <Link
      href="/studio/"
      className="rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface hover:text-text-primary"
    >
      写稿
    </Link>
  );
}
