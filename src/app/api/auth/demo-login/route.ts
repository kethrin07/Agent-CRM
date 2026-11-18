import { NextResponse } from "next/server";
import { env, isConfigured } from "@/lib/env";

/**
 * POST /api/auth/demo-login
 *
 * Shared demo login for the testing phase. Validates email + password against
 * fixed credentials held in server-only env vars (never shipped to the browser)
 * and returns the role to apply. NOT per-user security — a lightweight,
 * shareable gate while the real Supabase Auth build is pending.
 */

// Length-independent constant-time-ish comparison, so a wrong password can't be
// guessed from response timing. Same idea as the webhook's HMAC check.
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i % b.length);
  }
  return diff === 0;
}

export async function POST(req: Request) {
  if (!isConfigured("demoAuth")) {
    return NextResponse.json(
      { error: "Demo login not configured" },
      { status: 501 },
    );
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email || !password) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const adminEmail = (env.loginAdminEmail ?? "").trim().toLowerCase();
  const clientEmail = (env.loginClientEmail ?? "").trim().toLowerCase();

  if (email === adminEmail && safeEqual(password, env.loginAdminPassword ?? "")) {
    return NextResponse.json({ role: "admin" });
  }
  if (
    email === clientEmail &&
    safeEqual(password, env.loginClientPassword ?? "")
  ) {
    return NextResponse.json({ role: "client", clientId: env.loginClientId });
  }

  return NextResponse.json(
    { error: "Invalid email or password" },
    { status: 401 },
  );
}
