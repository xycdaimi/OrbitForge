"use client";

import { useEffect, useState } from "react";

const TOKEN_KEY = "orbitforge-id-token";

export function LoginPage() {
  const [href, setHref] = useState("");

  useEffect(() => {
    const rawDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN?.trim().replace(/\/$/, "") ?? "";
    const clientID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    if (!rawDomain || !clientID) {
      return;
    }
    const origin = rawDomain.startsWith("https://") || rawDomain.startsWith("http://")
      ? rawDomain
      : `https://${rawDomain}`;
    const redirect = `${window.location.origin}/`;
    const url = new URL(`${origin}/login`);
    url.searchParams.set("client_id", clientID);
    url.searchParams.set("response_type", "token");
    url.searchParams.set("scope", "openid email");
    url.searchParams.set("redirect_uri", redirect);
    setHref(url.toString());
  }, []);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-semibold text-text-primary">作者登录</h1>
      <p className="mt-3 text-sm leading-7 text-text-secondary">
        仅站点作者可以进入写稿后台。游客请返回首页阅读已发布文章。
      </p>
      {href ? (
        <a
          href={href}
          className="mt-8 inline-flex justify-center rounded-lg bg-accent-cyan px-4 py-3 text-sm font-medium text-bg-primary"
        >
          使用作者账号登录
        </a>
      ) : (
        <p className="mt-8 text-sm text-accent-violet">
          登录服务尚未配置。部署 Cognito 后设置 NEXT_PUBLIC_COGNITO_DOMAIN 与
          NEXT_PUBLIC_COGNITO_CLIENT_ID。
        </p>
      )}
    </main>
  );
}

export function storeTokenFromHash(): void {
  if (typeof window === "undefined") {
    return;
  }
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const token = hash.get("id_token");
  if (!token) {
    return;
  }
  window.sessionStorage.setItem(TOKEN_KEY, token);
  window.history.replaceState({}, "", window.location.pathname);
}

export function readAuthorToken(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.sessionStorage.getItem(TOKEN_KEY) ?? "";
}

export function clearAuthorToken(): void {
  window.sessionStorage.removeItem(TOKEN_KEY);
}
