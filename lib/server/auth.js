import { adminAuth, adminDb } from "../admin";
import { ROLES, ROLE_LIST } from "../constants/roles";
import { readRuntimeIdTokenFromRequest } from "../runtime-auth";

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

function getBearerToken(request) {
  return readRuntimeIdTokenFromRequest(request);
}

function getSessionCookieToken(request) {
  return request.cookies.get("admin_session")?.value || "";
}

export async function verifyRequestUser(request) {
  const token = getBearerToken(request) || getSessionCookieToken(request);
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);
    const email = decoded.email || "";

    return {
      uid: decoded.uid,
      email,
      isAdminClaim: decoded.admin === true,
      isAdminEmail: isAllowedAdminEmail(email),
    };
  } catch {
    return null;
  }
}

export async function getUserProfile(uid) {
  if (!uid) return null;
  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data();
  if (!ROLE_LIST.includes(data?.role)) return null;
  return { id: snap.id, ...data };
}

export async function verifyRequestWithProfile(request) {
  const authUser = await verifyRequestUser(request);
  if (!authUser) return { authUser: null, profile: null };
  const profile = await getUserProfile(authUser.uid);
  return { authUser, profile };
}

export function hasRole(profile, roles) {
  if (!profile?.role) return false;
  return roles.includes(profile.role);
}

export function isAdmin(profile, authUser) {
  return authUser?.isAdminClaim === true || authUser?.isAdminEmail === true;
}
