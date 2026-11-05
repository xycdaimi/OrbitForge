"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readAuthorToken, storeTokenFromHash } from "@/components/auth/LoginPage";
import { getDocument, saveDocument } from "@/lib/studio/client";

export function StudioEditor({ id }: { id: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Programming");
  const [tags, setTags] = useState("Draft");
  const [series, setSeries] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    storeTokenFromHash();
    if (!readAuthorToken()) {
      router.replace("/login/");
      return;
    }
    getDocument(id)
      .then((doc) => {
        setTitle(doc.title);
        setSlug(doc.slug);
        setDescription(doc.description);
        setCategory(doc.category);
        setTags(doc.tags.join(", "));
        setSeries(doc.series ?? "");
        setBody(doc.body ?? "");
      })
      .catch((err: Error) => setMessage(err.message));
  }, [id, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      await saveDocument(id, {
        title,
        slug,
        description,
        category,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        series,
        body,
      });
      setMessage("已保存草稿");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-12 lg:grid-cols-2">
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-3">
        <h1 className="text-2xl font-semibold text-text-primary">编辑草稿</h1>
        <input className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" />
        <input className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" />
        <input className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="摘要" />
        <input className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="分类" />
        <input className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="标签，逗号分隔" />
        <input className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2" value={series} onChange={(e) => setSeries(e.target.value)} placeholder="系列（可选）" />
        <textarea className="min-h-80 w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 font-mono text-sm" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Markdown 正文" />
        <div className="flex gap-3">
          <button type="submit" className="rounded-lg bg-accent-cyan px-4 py-2 text-sm font-medium text-bg-primary">保存草稿</button>
          <button type="button" className="rounded-lg border border-border-default px-4 py-2 text-sm" onClick={() => setPreview((v) => !v)}>预览</button>
        </div>
        {message ? <p className="text-sm text-text-secondary">{message}</p> : null}
      </form>
      {preview ? (
        <article className="rounded-2xl border border-border-default bg-bg-surface/60 p-5">
          <p className="text-xs text-accent-violet">预览不会生成公开地址</p>
          <h2 className="mt-3 text-2xl font-semibold text-text-primary">{title}</h2>
          <p className="mt-2 text-sm text-text-secondary">{description}</p>
          <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-7 text-text-primary">{body}</pre>
        </article>
      ) : null}
    </main>
  );
}
