"use client";

import { useState, type FormEvent } from "react";

const TOKEN_KEY = "orbitforge-id-token";

function cognitoRegion(): string {
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "";
  const matched = domain.match(/auth\.([a-z0-9-]+)\.amazoncognito\.com/);
  return matched?.[1] ?? "us-west-2";
}

export function LoginPage() {
  const clientID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch(`https://cognito-idp.${cognitoRegion()}.amazonaws.com/`, {
        method: "POST",
        headers: {
          "content-type": "application/x-amz-json-1.1",
          "x-amz-target": "AWSCognitoIdentityProviderService.InitiateAuth",
        },
        body: JSON.stringify({
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: clientID,
          AuthParameters: {
            USERNAME: email.trim(),
            PASSWORD: password,
          },
        }),
      });
      const payload = (await response.json()) as {
        AuthenticationResult?: { IdToken?: string };
        message?: string;
        __type?: string;
      };
      const token = payload.AuthenticationResult?.IdToken;
      if (!response.ok || !token) {
        const code = payload.__type ?? "";
        setError(
          code.includes("NotAuthorized") || code.includes("UserNotFound")
            ? "邮箱或密码不正确。"
            : "登录失败，请稍后再试。",
        );
        return;
      }
      window.sessionStorage.setItem(TOKEN_KEY, token);
      window.location.assign("/");
    } catch {
      setError("登录服务暂时无法连接。");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-semibold text-text-primary">作者登录</h1>
      <p className="mt-3 text-sm leading-7 text-text-secondary">
        仅站点作者可以进入写稿后台。游客请返回首页阅读已发布文章。
      </p>
      {clientID ? (
        <form className="mt-8 flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            邮箱
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-text-primary"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-secondary">
            密码
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-text-primary"
            />
          </label>
          {error ? <p className="text-sm text-accent-violet">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex justify-center rounded-lg bg-accent-cyan px-4 py-3 text-sm font-medium text-bg-primary disabled:opacity-60"
          >
            {pending ? "正在登录" : "登录"}
          </button>
        </form>
      ) : (
        <p className="mt-8 text-sm text-accent-violet">
          登录服务尚未配置。部署 Cognito 后设置 NEXT_PUBLIC_COGNITO_CLIENT_ID。
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
