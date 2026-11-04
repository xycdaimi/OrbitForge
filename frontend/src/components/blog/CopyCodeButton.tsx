"use client";

import { useState } from "react";

type CopyCodeButtonProps = {
  code: string;
};

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-md border border-border-default bg-bg-elevated px-2 py-1 text-xs text-text-secondary hover:text-accent-cyan"
    >
      {copied ? "已复制" : "复制"}
    </button>
  );
}
