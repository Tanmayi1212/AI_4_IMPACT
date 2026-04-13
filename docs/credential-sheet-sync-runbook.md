# Credential Sheets Sync Runbook

This runbook covers safe rollout of credential export to Google Sheets for hackathon teams.

## Trigger points

A credential export event is created when:

- admin marks hackathon payment as `verify` (`POST /api/admin/verify-payment`)
- admin regenerates credentials (`POST /api/admin/regenerate-team-credentials`)

Each successful action creates one event document in Firestore collection `credential_export_events`.

## Safety properties

- Credential issuance and event creation are committed in the same Firestore batch.
- Admin action success does not depend on Google Sheets availability.
- Sheets sync is best-effort and retryable.
- Deterministic sequence allocation maps each event to a fixed sheet row to avoid duplicate rows on retries.

## Required environment variables

Set these on App Hosting backend before enabling:

- `CREDENTIAL_SHEET_SYNC_ENABLED=true`
- `GOOGLE_SHEETS_SPREADSHEET_ID=<spreadsheet_id>`
- `GOOGLE_SHEETS_WORKSHEET=CredentialEvents`
- `GOOGLE_SHEETS_CLIENT_EMAIL=<service_account_email>`
- `GOOGLE_SHEETS_PRIVATE_KEY=<private_key_with_newlines>`

Optional tuning:

- `CREDENTIAL_EXPORT_EVENTS_COLLECTION=credential_export_events`
- `CREDENTIAL_EXPORT_COUNTER_DOC=credential_sheet_sync`
- `CREDENTIAL_SHEET_HEADER_ROWS=1`
- `CREDENTIAL_SHEET_SYNC_TIMEOUT_MS=3500`
- `CREDENTIAL_SHEET_SYNC_MAX_RETRIES=15`
- `CREDENTIAL_SHEET_SYNC_RETRY_BASE_SECONDS=30`
- `CREDENTIAL_SHEET_SYNC_RETRY_MAX_SECONDS=3600`

## Sheet schema (A:R)

1. sequence
2. event_id
3. event_type
4. created_at_iso
5. transaction_id
6. registration_ref
7. registration_type
8. team_id
9. password_version
10. password_issued
11. temporary_password
12. leader_name
13. leader_email
14. leader_phone
15. issued_by_admin_uid
16. source
17. request_id
18. sheet_sync_status

## Rollout steps

1. Keep `CREDENTIAL_SHEET_SYNC_ENABLED=false` and deploy code.
2. Verify admin verify/regenerate actions still work normally.
3. Configure service-account env vars in App Hosting.
4. Set `CREDENTIAL_SHEET_SYNC_ENABLED=true`.
5. Run a controlled verify/regenerate action on a test team.
6. Confirm row appears in Google Sheet.

## Replay pending/failed events

Use:

```bash
npm run sheets:sync:pending -- 100
```

Force retry including dead-letter:

```bash
npm run sheets:sync:pending -- 100 --force
```

## Monitoring checks

- Firestore: count events with `sheet_sync.status in ["FAILED", "DEAD_LETTER"]`.
- Google Sheets: sequence continuity (no missing rows in active range).
- Admin flows: verify/regenerate response times remain acceptable.
