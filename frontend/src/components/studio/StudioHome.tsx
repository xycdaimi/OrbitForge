"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthorToken, readAuthorToken, storeTokenFromHash } from "@/components/auth/LoginPage";
import { createDocument, listDocuments, type StudioDocument } from "@/lib/studio/client";

export function StudioHome() {
  const router = useRouter();
  const [docs, setDocs] = useState<StudioDocument[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    storeTokenFromHash();
    if (!readAuthorToken()) {
      router.replace("/login/");
      return;
    }
    listDocuments()
      .then((result) => setDocs(result.documents ?? []))
      .catch((err: Error) => setError(err.message));
  }, [router]);

  async function onCreate() {
    const doc = await createDocument({
      title: "未命名草稿",
      slug: `draft-${Date.now().toString(36)}`,
      description: "请填写摘要",
      category: "Programming",
      tags: ["Draft"],
      body: "",
    });
    router.push(`/studio/edit/?id=${doc.id}`);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-text-primary">写稿</h1>
        <button
          type="button"
          className="text-sm text-text-secondary"
          onClick={() => {
            clearAuthorToken();
            router.replace("/");
          }}
        >
          退出
        </button>
      </div>
      <p className="mt-3 text-sm text-text-secondary">
        草稿只在后台可见。发布后才会出现在公开站点。
      </p>
      <button
        type="button"
        onClick={() => void onCreate()}
        className="mt-6 rounded-lg bg-accent-cyan px-4 py-2 text-sm font-medium text-bg-primary"
      >
        新建草稿
      </button>
      {error ? <p className="mt-4 text-sm text-accent-violet">{error}</p> : null}
      <ul className="mt-8 space-y-3">
        {docs.map((doc) => (
          <li key={doc.id}>
            <Link
              href={`/studio/edit/?id=${doc.id}`}
              className="block rounded-xl border border-border-default bg-bg-surface/70 p-4 hover:border-accent-cyan/40"
            >
              <span className="text-xs text-text-secondary">{doc.status}</span>
              <span className="mt-1 block text-text-primary">{doc.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
