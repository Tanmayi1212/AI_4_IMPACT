export const RUNTIME_ID_TOKEN_HEADER = "x-firebase-id-token";

function asTrimmedString(value) {
  return String(value || "").trim();
}

export function buildRuntimeIdTokenHeaders(idToken, extraHeaders = {}) {
  const normalizedToken = asTrimmedString(idToken);

  if (!normalizedToken) {
    return { ...extraHeaders };
  }

  return {
    ...extraHeaders,
    [RUNTIME_ID_TOKEN_HEADER]: normalizedToken,
  };
}

export function readRuntimeIdTokenFromRequest(request) {
  const headerToken = asTrimmedString(request.headers.get(RUNTIME_ID_TOKEN_HEADER));
  if (headerToken) {
    return headerToken;
  }

  const authHeader = asTrimmedString(request.headers.get("authorization"));
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return "";
  }

  return asTrimmedString(authHeader.slice(7));
}
