import { siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-6 py-24">
      <p className="text-sm tracking-[0.2em] text-zinc-500 uppercase">
        {siteConfig.nameZh}
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
        {siteConfig.name}
      </h1>
      <p className="mt-4 text-lg text-zinc-400">{siteConfig.slogan}</p>
      <p className="mt-2 text-base text-zinc-500">{siteConfig.sloganZh}</p>
    </main>
  );
}
