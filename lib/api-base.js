const ENV = globalThis?.process?.env || {};

function normalizeBaseUrl(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  return normalized.replace(/\/$/, "");
}

export function getRuntimeApiBaseUrl() {
  const configuredBase =
    ENV.NEXT_PUBLIC_RUNTIME_API_BASE_URL || "";

  const normalizedConfiguredBase = normalizeBaseUrl(configuredBase);
  return normalizedConfiguredBase;
}

export function toRuntimeApiUrl(pathname) {
  const normalizedPath = String(pathname || "").trim();
  if (!normalizedPath.startsWith("/")) {
    throw new Error("Runtime API pathname must start with '/'.");
  }

  const baseUrl = getRuntimeApiBaseUrl();
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}
