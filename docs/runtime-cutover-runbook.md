# Runtime API Cutover Runbook (ai4impact.web.app)

This runbook enables API runtime on the existing Firebase Hosting domain without changing the public URL.

## Current status

- Production config (`firebase.json`) now includes `/api/**` runtime rewrites to `ai4impact-backend`.
- Runtime backend is healthy at:
  - `https://ai4impact-backend--ai4impact-cc315.us-central1.hosted.app`
- Runtime checks on `ai4impact.web.app` should now return runtime statuses (`401/400`) for API probes.

## Why cutover failed earlier

Hosting rewrite to Cloud Run service `ai4impact-backend` returned `403 Forbidden`.
Further production validation (Apr 13, 2026) showed that App Hosting rewrite invocation is treated as unauthenticated at Cloud Run.
When `allUsers` was removed from `roles/run.invoker`, `/api/*` requests returned 403 immediately.

Resolution applied:

- Cloud Run service `ai4impact-backend` now has `roles/run.invoker` granted to `allUsers` to allow Hosting rewrite invocation.

Evidence captured:

- Cloud Run request logs (`run.googleapis.com/requests`) show 403 with message: "The request was not authenticated..."
- Affected requests had label `goog-managed-by=firebase-app-hosting` and request URL host `*.a.run.app`.

Operational conclusion:

- In the current Firebase App Hosting + Hosting rewrite setup, removing `allUsers` from Cloud Run invoker breaks runtime API access on `ai4impact.web.app`.

## One-time IAM prerequisite

Ensure `roles/run.invoker` on Cloud Run service `ai4impact-backend` includes:

- `allUsers` (required for current App Hosting rewrite invocation path)
- optional: `serviceAccount:firebase-app-hosting-compute@ai4impact-cc315.iam.gserviceaccount.com` (kept for future compatibility)

Recommended command:

```bash
npm run iam:grant-hosting-invoker -- ai4impact-cc315 ai4impact-backend us-central1 646262423427 allUsers
```

If your operator account does not have Cloud Run IAM admin permissions, this grant must be done by a project owner.

## Commands (operational checks)

1. Validate backend runtime directly:

```bash
npm run health:runtime -- https://ai4impact-backend--ai4impact-cc315.us-central1.hosted.app
```

2. Deploy API rewrite config to production hosting:

```bash
npx firebase-tools deploy --project ai4impact-cc315 --only hosting --config firebase.runtime-api-rewrite.json --non-interactive
```

3. Validate production domain runtime:

```bash
npm run health:runtime -- https://ai4impact.web.app
```

Expected:
- `GET /api/team/dashboard` -> `401` or `403`
- `POST /api/team/access/resolve` with empty body -> `400`
- `POST /api/admin/session` with empty body -> `400`

## Fast rollback

If checks fail after cutover, redeploy stable static hosting config:

```bash
npx firebase-tools deploy --project ai4impact-cc315 --only hosting --config firebase.static-hosting.json --non-interactive
```

## Notes

- Registration submissions from current frontend are client-side Firestore writes and remain unaffected by API rewrite cutover.
- Admin credential generation, queueing credential emails, and other privileged admin operations require runtime APIs.
- Because Cloud Run currently allows unauthenticated invoke for rewrite compatibility, keep strict app-level auth checks on all privileged API routes and avoid exposing privileged actions without bearer-token admin validation.

## Token transport requirement

App Hosting + Cloud Run rewrite currently rejects requests carrying Firebase ID tokens in the standard `Authorization: Bearer <idToken>` header with edge-level HTML `401 Unauthorized`.

To keep privileged APIs functional:

- Send Firebase ID token in custom request header: `x-firebase-id-token`
- Keep backend token parsing backward-compatible by accepting both:
  - `x-firebase-id-token`
  - `Authorization: Bearer ...` (for local/dev or non-rewrite paths)

Validation check:

- Request with `Authorization: Bearer foo` to `/api/admin/registrations` returns HTML 401 from edge (blocked before app)
- Request with `x-firebase-id-token: foo` reaches app auth and returns JSON 401/403 as expected

## API base routing

Client-side admin/team/auth API calls use `lib/api-base.js`.

- Default runtime base: same-origin path (no cross-origin default)
- Optional override env: `NEXT_PUBLIC_RUNTIME_API_BASE_URL`

This keeps production registrations stable while allowing explicit runtime-base override only when needed.
