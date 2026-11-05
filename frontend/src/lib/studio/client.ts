import { readAuthorToken } from "@/components/auth/LoginPage";

export type StudioDocument = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  category: string;
  tags: string[];
  series?: string;
  coverKey?: string;
  body?: string;
};

function apiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return (configured && configured.length > 0 ? configured : "/api/v1").replace(
    /\/$/,
    "",
  );
}

async function studioFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = readAuthorToken();
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(payload?.message ?? `request failed (${response.status})`);
  }
  return payload as T;
}

export function listDocuments() {
  return studioFetch<{ documents: StudioDocument[] }>("/studio/documents");
}

export function createDocument(input: Partial<StudioDocument>) {
  return studioFetch<StudioDocument>("/studio/documents", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getDocument(id: string) {
  return studioFetch<StudioDocument>(`/studio/documents/${encodeURIComponent(id)}`);
}

export function saveDocument(id: string, input: Partial<StudioDocument>) {
  return studioFetch<StudioDocument>(`/studio/documents/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ ...input, id }),
  });
}
