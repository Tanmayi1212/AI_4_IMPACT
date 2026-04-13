const fs = require("fs");
const path = require("path");

const DEFAULT_PROJECT_ID = "ai4impact-cc315";
const DEFAULT_PROJECT_NUMBER = "646262423427";
const DEFAULT_REGION = "us-central1";
const DEFAULT_SERVICE = "ai4impact-backend";

function getFirebaseCliAccessToken() {
  const configPath = path.join(
    process.env.USERPROFILE || "",
    ".config",
    "configstore",
    "firebase-tools.json"
  );

  if (!fs.existsSync(configPath)) {
    throw new Error(`firebase-tools auth config not found: ${configPath}`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const token = String(config?.tokens?.access_token || "").trim();

  if (!token) {
    throw new Error("Missing Firebase CLI access token. Run 'npx firebase-tools login' and retry.");
  }

  return token;
}

function buildApiBase({ projectId, region, service }) {
  return `https://${region}-run.googleapis.com/v2/projects/${projectId}/locations/${region}/services/${service}`;
}

async function apiCall({ token, method, url, body }) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let json;

  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!response.ok) {
    const message =
      json?.error?.message || json?.raw || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return json;
}

function addInvokerBinding(policy, member) {
  const nextPolicy = {
    ...policy,
    bindings: Array.isArray(policy?.bindings) ? [...policy.bindings] : [],
  };

  const invokerRole = "roles/run.invoker";
  const bindingIndex = nextPolicy.bindings.findIndex((entry) => entry?.role === invokerRole);

  if (bindingIndex >= 0) {
    const currentBinding = nextPolicy.bindings[bindingIndex] || {};
    const currentMembers = Array.isArray(currentBinding.members)
      ? [...currentBinding.members]
      : [];

    if (currentMembers.includes(member)) {
      return { changed: false, policy: nextPolicy };
    }

    nextPolicy.bindings[bindingIndex] = {
      ...currentBinding,
      members: [...currentMembers, member],
    };

    return { changed: true, policy: nextPolicy };
  }

  nextPolicy.bindings.push({
    role: invokerRole,
    members: [member],
  });

  return { changed: true, policy: nextPolicy };
}

async function main() {
  const projectId = String(process.argv[2] || DEFAULT_PROJECT_ID).trim();
  const service = String(process.argv[3] || DEFAULT_SERVICE).trim();
  const region = String(process.argv[4] || DEFAULT_REGION).trim();
  const projectNumber = String(process.argv[5] || DEFAULT_PROJECT_NUMBER).trim();
  const principalInput = String(process.argv[6] || "allUsers").trim();

  if (!projectId || !service || !region || !projectNumber) {
    throw new Error("projectId, service, region, and projectNumber are required.");
  }

  const defaultServiceAgent = `serviceAccount:service-${projectNumber}@gcp-sa-firebasehosting.iam.gserviceaccount.com`;
  const member = principalInput.includes("@") && !principalInput.startsWith("serviceAccount:")
    ? `serviceAccount:${principalInput}`
    : (principalInput || defaultServiceAgent);

  const token = getFirebaseCliAccessToken();
  const apiBase = buildApiBase({ projectId, region, service });

  const currentPolicy = await apiCall({
    token,
    method: "GET",
    url: `${apiBase}:getIamPolicy`,
  });

  const { changed, policy } = addInvokerBinding(currentPolicy, member);

  if (!changed) {
    console.log(`No change required. ${member} already has roles/run.invoker.`);
    return;
  }

  const nextPolicy = {
    version: Number(policy?.version || 1),
    bindings: policy.bindings,
    etag: policy?.etag,
  };

  await apiCall({
    token,
    method: "POST",
    url: `${apiBase}:setIamPolicy`,
    body: { policy: nextPolicy },
  });

  console.log(`Granted roles/run.invoker to ${member} on ${service} (${region}).`);
}

main().catch((error) => {
  console.error(`Failed to grant Hosting invoker permission: ${error.message}`);
  process.exit(1);
});
