import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const idx = line.indexOf("=");
    if (idx === -1) {
      continue;
    }

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function asTrimmedString(value) {
  return String(value || "").trim();
}

function toIsoString(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function extractStorageObjectPath(screenshotUrl, bucketName) {
  const raw = asTrimmedString(screenshotUrl);
  if (!raw) {
    return null;
  }

  if (raw.startsWith(`gs://${bucketName}/`)) {
    return raw.slice(`gs://${bucketName}/`.length);
  }

  try {
    const parsed = new URL(raw);

    if (parsed.hostname !== "firebasestorage.googleapis.com") {
      return null;
    }

    const segments = parsed.pathname.split("/").filter(Boolean);
    const bucketIndex = segments.indexOf("b");
    const objectIndex = segments.indexOf("o");

    if (
      bucketIndex === -1 ||
      objectIndex === -1 ||
      bucketIndex + 1 >= segments.length ||
      objectIndex + 1 >= segments.length
    ) {
      return null;
    }

    const urlBucketName = segments[bucketIndex + 1];
    if (urlBucketName !== bucketName) {
      return null;
    }

    return decodeURIComponent(segments.slice(objectIndex + 1).join("/"));
  } catch {
    return null;
  }
}

const TEST_EMAIL_DOMAINS = new Set([
  "example.com",
  "test.com",
  "mailinator.com",
  "tempmail.com",
  "fake.com",
]);

const TEST_PHONE_VALUES = new Set([
  "0000000000",
  "1111111111",
  "1234567890",
  "9999999999",
  "8888888888",
  "7777777777",
  "6666666666",
]);

const TEST_KEYWORDS = ["test", "dummy", "sample", "cleanup", "qa", "trial", "temp"];

function hasTestKeyword(value) {
  const normalized = asTrimmedString(value).toLowerCase();
  if (!normalized) {
    return null;
  }

  return TEST_KEYWORDS.find((keyword) => normalized.includes(keyword)) || null;
}

function collectTestReasons({ transaction, registration, participants }) {
  const reasons = [];

  const transactionKeyword = hasTestKeyword(
    `${transaction?.transaction_id || ""} ${transaction?.upi_transaction_id || ""}`
  );
  if (transactionKeyword) {
    reasons.push(`Transaction fields contain keyword: ${transactionKeyword}`);
  }

  const teamKeyword = hasTestKeyword(
    `${registration?.team_name || ""} ${registration?.college || ""} ${registration?.state || ""}`
  );
  if (teamKeyword) {
    reasons.push(`Registration fields contain keyword: ${teamKeyword}`);
  }

  participants.forEach((participant) => {
    const email = asTrimmedString(participant?.email).toLowerCase();
    const phone = asTrimmedString(participant?.phone);
    const name = asTrimmedString(participant?.name);

    const emailLocal = email.split("@")[0] || "";
    const emailDomain = email.split("@")[1] || "";

    if (emailDomain && TEST_EMAIL_DOMAINS.has(emailDomain)) {
      reasons.push(`Participant email uses test domain: ${emailDomain}`);
    }

    const emailKeyword = hasTestKeyword(emailLocal);
    if (emailKeyword) {
      reasons.push(`Participant email local-part contains keyword: ${emailKeyword}`);
    }

    const nameKeyword = hasTestKeyword(name);
    if (nameKeyword) {
      reasons.push(`Participant name contains keyword: ${nameKeyword}`);
    }

    if (phone && (TEST_PHONE_VALUES.has(phone) || /^(\d)\1{9}$/.test(phone))) {
      reasons.push(`Participant phone looks synthetic: ${phone}`);
    }
  });

  return Array.from(new Set(reasons));
}

async function loadWorkshopRegistrationContext(adminDb, registrationRef) {
  const registrationId = asTrimmedString(registrationRef);
  if (!registrationId) {
    return {
      registration: null,
      participants: [],
    };
  }

  const workshopDoc = await adminDb.collection("workshop_registrations").doc(registrationId).get();
  if (!workshopDoc.exists) {
    return {
      registration: {
        workshop_id: registrationId,
      },
      participants: [],
    };
  }

  const workshopData = workshopDoc.data() || {};
  const participantId = asTrimmedString(workshopData.participant_id);
  let participants = [];

  if (participantId) {
    const participantDoc = await adminDb.collection("participants").doc(participantId).get();
    if (participantDoc.exists) {
      const participantData = participantDoc.data() || {};
      participants = [
        {
          participant_id: participantId,
          name: participantData.name || null,
          email: participantData.email || null,
          phone: participantData.phone || null,
          roll: participantData.roll_number || participantData.roll || null,
          branch: participantData.branch || participantData.department || null,
          year_of_study: participantData.year_of_study || participantData.yearOfStudy || null,
          state: participantData.state || workshopData.state || null,
        },
      ];
    }
  }

  return {
    registration: {
      workshop_id: workshopDoc.id,
      team_name: participants[0]?.name || null,
      college: workshopData.college || null,
      state: workshopData.state || null,
    },
    participants,
  };
}

async function loadHackathonRegistrationContext(adminDb, registrationRef) {
  const registrationId = asTrimmedString(registrationRef);
  if (!registrationId) {
    return {
      registration: null,
      participants: [],
    };
  }

  const teamDoc = await adminDb.collection("hackathon_registrations").doc(registrationId).get();
  if (!teamDoc.exists) {
    return {
      registration: {
        team_id: registrationId,
      },
      participants: [],
    };
  }

  const teamData = teamDoc.data() || {};
  const memberIds = Array.isArray(teamData.member_ids) ? teamData.member_ids : [];

  const participantDocs = await Promise.all(
    memberIds.map((participantId) => adminDb.collection("participants").doc(participantId).get())
  );

  const participants = participantDocs
    .filter((participantDoc) => participantDoc.exists)
    .map((participantDoc) => {
      const participantData = participantDoc.data() || {};
      return {
        participant_id: participantDoc.id,
        name: participantData.name || null,
        email: participantData.email || null,
        phone: participantData.phone || null,
        roll: participantData.roll_number || participantData.roll || null,
        branch: participantData.branch || participantData.department || null,
        year_of_study: participantData.year_of_study || participantData.yearOfStudy || null,
        state: participantData.state || teamData.state || null,
      };
    });

  return {
    registration: {
      team_id: teamDoc.id,
      team_name: teamData.team_name || null,
      college: teamData.college || null,
      state: teamData.state || null,
      team_size: teamData.team_size || participants.length || null,
    },
    participants,
  };
}

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  const { adminDb, adminStorage } = await import("../firebaseAdmin.js");

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    null;

  const bucketName = adminStorage.name;

  console.log("Running storage reference audit...");
  console.log(`Project: ${projectId || "unknown"}`);
  console.log(`Bucket: ${bucketName}`);

  const transactionsSnapshot = await adminDb
    .collection("transactions")
    .orderBy("created_at", "desc")
    .get();

  const transactions = transactionsSnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  const referencedRecords = await Promise.all(
    transactions.map(async (transaction) => {
      const registrationType = asTrimmedString(transaction.registration_type).toLowerCase();
      const registrationRef = asTrimmedString(transaction.registration_ref);

      let registrationContext = {
        registration: null,
        participants: [],
      };

      if (registrationType === "workshop") {
        registrationContext = await loadWorkshopRegistrationContext(adminDb, registrationRef);
      } else if (registrationType === "hackathon") {
        registrationContext = await loadHackathonRegistrationContext(adminDb, registrationRef);
      }

      const storageObjectPath = extractStorageObjectPath(transaction.screenshot_url, bucketName);
      const testReasons = collectTestReasons({
        transaction,
        registration: registrationContext.registration || {},
        participants: registrationContext.participants || [],
      });

      return {
        transaction_id: asTrimmedString(transaction.transaction_id || transaction.id),
        registration_type: registrationType || null,
        status: asTrimmedString(transaction.status || "pending") || "pending",
        registration_ref: registrationRef || null,
        upi_transaction_id: asTrimmedString(transaction.upi_transaction_id) || null,
        screenshot_url: asTrimmedString(transaction.screenshot_url) || null,
        storage_object_path: storageObjectPath,
        created_at: toIsoString(transaction.created_at),
        verified_at: toIsoString(transaction.verified_at),
        registration: registrationContext.registration,
        participants: registrationContext.participants,
        potential_test_data: testReasons.length > 0,
        potential_test_reasons: testReasons,
      };
    })
  );

  const [storageFiles] = await adminStorage.getFiles({ prefix: "payments/" });

  const storageObjectEntries = storageFiles
    .map((file) => ({
      object_path: file.name,
      size: Number(file?.metadata?.size || 0),
      updated_at: file?.metadata?.updated || null,
      content_type: file?.metadata?.contentType || null,
    }))
    .filter((entry) => asTrimmedString(entry.object_path));

  const storageObjectsByPath = new Map(
    storageObjectEntries.map((entry) => [entry.object_path, entry])
  );

  const referencedPaths = new Set(
    referencedRecords
      .map((record) => asTrimmedString(record.storage_object_path))
      .filter(Boolean)
  );

  const unreferencedStorageObjects = storageObjectEntries.filter(
    (entry) => !referencedPaths.has(entry.object_path)
  );

  const referencedMissingStorageObjects = Array.from(referencedPaths)
    .filter((objectPath) => !storageObjectsByPath.has(objectPath));

  const referenceView = referencedRecords.map((record) => {
    const objectPath = asTrimmedString(record.storage_object_path);
    return {
      ...record,
      storage_object_exists: objectPath ? storageObjectsByPath.has(objectPath) : false,
    };
  });

  const potentialTestReferences = referenceView.filter((record) => record.potential_test_data);

  const generatedAt = new Date();
  const stamp = generatedAt.toISOString().replace(/[:.]/g, "-");

  const outputDir = path.join(process.cwd(), "scripts", "output");
  fs.mkdirSync(outputDir, { recursive: true });

  const jsonPath = path.join(outputDir, `storage-reference-audit-${stamp}.json`);
  const csvPath = path.join(outputDir, `storage-reference-audit-${stamp}.csv`);

  const auditPayload = {
    generated_at: generatedAt.toISOString(),
    project_id: projectId,
    bucket: bucketName,
    summary: {
      total_transactions: referenceView.length,
      transactions_with_screenshot_reference: referenceView.filter((record) => record.storage_object_path).length,
      total_storage_objects_under_payments: storageObjectEntries.length,
      unreferenced_storage_objects: unreferencedStorageObjects.length,
      referenced_but_missing_storage_objects: referencedMissingStorageObjects.length,
      potential_test_references: potentialTestReferences.length,
    },
    referenced_records: referenceView,
    unreferenced_storage_objects: unreferencedStorageObjects,
    referenced_but_missing_storage_objects: referencedMissingStorageObjects,
    potential_test_references: potentialTestReferences,
  };

  fs.writeFileSync(jsonPath, JSON.stringify(auditPayload, null, 2), "utf8");

  const csvHeaders = [
    "transaction_id",
    "registration_type",
    "status",
    "registration_ref",
    "storage_object_path",
    "storage_object_exists",
    "screenshot_url",
    "team_or_name",
    "college",
    "state",
    "participant_count",
    "participant_emails",
    "participant_phones",
    "potential_test_data",
    "potential_test_reasons",
  ];

  const csvRows = referenceView.map((record) => {
    const registration = record.registration || {};
    const participants = Array.isArray(record.participants) ? record.participants : [];

    const teamOrName =
      registration.team_name ||
      participants[0]?.name ||
      registration.workshop_id ||
      registration.team_id ||
      "";

    const participantEmails = participants
      .map((participant) => asTrimmedString(participant.email))
      .filter(Boolean)
      .join(" | ");

    const participantPhones = participants
      .map((participant) => asTrimmedString(participant.phone))
      .filter(Boolean)
      .join(" | ");

    return [
      record.transaction_id,
      record.registration_type,
      record.status,
      record.registration_ref,
      record.storage_object_path,
      record.storage_object_exists ? "yes" : "no",
      record.screenshot_url,
      teamOrName,
      registration.college || "",
      registration.state || "",
      participants.length,
      participantEmails,
      participantPhones,
      record.potential_test_data ? "yes" : "no",
      (record.potential_test_reasons || []).join(" | "),
    ];
  });

  const csvContent = [csvHeaders, ...csvRows]
    .map((row) => row.map((cell) => csvEscape(cell)).join(","))
    .join("\n");

  fs.writeFileSync(csvPath, csvContent, "utf8");

  console.log("Audit completed. No deletions were performed.");
  console.log(`Transactions analyzed: ${auditPayload.summary.total_transactions}`);
  console.log(
    `Storage objects under payments/: ${auditPayload.summary.total_storage_objects_under_payments}`
  );
  console.log(
    `Unreferenced storage objects: ${auditPayload.summary.unreferenced_storage_objects}`
  );
  console.log(
    `Potential test references: ${auditPayload.summary.potential_test_references}`
  );
  console.log(`JSON report: ${jsonPath}`);
  console.log(`CSV report: ${csvPath}`);
}

main().catch((error) => {
  console.error("Storage reference audit failed:", error?.message || error);
  process.exit(1);
});
