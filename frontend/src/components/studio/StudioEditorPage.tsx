"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { StudioEditor } from "@/components/studio/StudioEditor";

function EditorRoute() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  if (!id) {
    return <p className="px-4 py-12 text-text-secondary">缺少稿件 id。</p>;
  }
  return <StudioEditor id={id} />;
}

export function StudioEditorPage() {
  return (
    <Suspense fallback={<p className="px-4 py-12 text-text-secondary">加载编辑器…</p>}>
      <EditorRoute />
    </Suspense>
  );
}
