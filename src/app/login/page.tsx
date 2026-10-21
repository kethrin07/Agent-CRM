"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/nav";
import { GoogleIcon } from "@/components/icons";
import { useRole, type Role } from "@/lib/role";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");

  const notConnected = () =>
    setNotice("Sign-in isn’t connected yet — use Preview access below.");

  const choose = (role: Role) => {
    setRole(role);
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-6 text-ink">
      <div className="card flex w-full max-w-sm flex-col gap-6 p-7">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo />
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold">Sign in to Milvado</h1>
            <p className="text-sm text-muted">Welcome back — please sign in.</p>
          </div>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={notConnected}
          className="flex items-center justify-center gap-2.5 rounded-lg border border-border-strong bg-card px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-hover"
        >
          <GoogleIcon size={18} />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-grow bg-border" />
          or
          <span className="h-px flex-grow bg-border" />
        </div>

        {/* Email + password */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            notConnected();
          }}
          className="flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1.5 text-[13px] font-medium">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="min-h-11 rounded-lg border border-border-strong bg-card px-3 text-sm font-normal text-ink outline-none focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-medium">
            <span className="flex items-center justify-between">
              Password
              <button
                type="button"
                onClick={notConnected}
                className="text-xs font-normal text-brand"
              >
                Forgot?
              </button>
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="min-h-11 rounded-lg border border-border-strong bg-card px-3 text-sm font-normal text-ink outline-none focus:border-brand"
            />
          </label>

          <button
            type="submit"
            className="min-h-11 rounded-lg bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Sign in
          </button>
        </form>

        {notice && (
          <p className="-mt-2 text-center text-xs text-muted2">{notice}</p>
        )}

        {/* Preview access (no backend yet) */}
        <div className="flex flex-col gap-2 border-t border-hairline pt-5">
          <span className="text-center text-xs text-muted2">
            Preview access — backend not connected
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => choose("admin")}
              className="flex-grow rounded-lg border border-border-strong bg-card px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-hover"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => choose("client")}
              className="flex-grow rounded-lg border border-border-strong bg-card px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-hover"
            >
              Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
