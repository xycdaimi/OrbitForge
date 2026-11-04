"use client";

import { useState } from "react";

type CoverImageProps = {
  src?: string;
  alt: string;
  className?: string;
};

function isPublicPath(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}

export function CoverImage({ src, alt, className }: CoverImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || !isPublicPath(src) || failed) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export; hide on load error
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
