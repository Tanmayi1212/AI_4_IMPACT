import { NextResponse } from "next/server";
import { adminAuth } from "../../../../../firebaseAdmin";
import { readRuntimeIdTokenFromRequest } from "../../../../../lib/runtime-auth";

const ADMIN_EMAILS = (
  globalThis?.process?.env?.ADMIN_EMAILS ||
  globalThis?.process?.env?.NEXT_PUBLIC_ADMIN_EMAILS ||
  ""
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function isAllowedAdminEmail(email) {
  return ADMIN_EMAILS.includes((email || "").trim().toLowerCase());
}

function unauthorized(message) {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function requireAdmin(request) {
  const bearerToken = readRuntimeIdTokenFromRequest(request);
  const sessionCookieToken = request.cookies?.get?.("admin_session")?.value?.trim?.() || "";

  const candidateTokens = [bearerToken, sessionCookieToken].filter(Boolean);

  if (candidateTokens.length === 0) {
    return { error: unauthorized("Missing authentication token.") };
  }

  for (const token of candidateTokens) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);

      if (decodedToken.admin !== true && !isAllowedAdminEmail(decodedToken.email)) {
        return {
          error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
        };
      }

      return { decodedToken };
    } catch {
      // Try next candidate token source.
    }
  }

  return { error: unauthorized("Invalid or expired Firebase ID token.") };
}
