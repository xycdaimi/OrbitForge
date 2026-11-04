"use client";

import dynamic from "next/dynamic";

const StarfieldCanvas = dynamic(
  () =>
    import("./StarfieldCanvas").then((module) => module.StarfieldCanvas),
  {
    ssr: false,
    loading: () => null,
  },
);

export function StarfieldLazy() {
  return <StarfieldCanvas />;
}
