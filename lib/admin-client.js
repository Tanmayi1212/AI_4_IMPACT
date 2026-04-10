import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

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

function toParticipantFromDoc(participantData, fallback = {}) {
  if (!participantData) {
    return null;
  }

  return {
    name: participantData?.name || null,
    email: participantData?.email || null,
    phone: participantData?.phone || null,
    roll: participantData?.roll_number || participantData?.roll || null,
    branch: participantData?.branch || participantData?.department || fallback?.branch || null,
    year_of_study:
      participantData?.year_of_study ||
      participantData?.yearOfStudy ||
      fallback?.year_of_study ||
      fallback?.yearOfStudy ||
      null,
    state: participantData?.state || fallback?.state || null,
    participant_id: participantData?.participant_id || null,
  };
}

async function loadDocsById(db, collectionName, ids) {
  const uniqueIds = Array.from(new Set(ids.map((id) => asTrimmedString(id)).filter(Boolean)));

  const docs = await Promise.all(
    uniqueIds.map(async (id) => {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    })
  );

  const map = new Map();
  docs.forEach((entry) => {
    if (entry) {
      map.set(entry.id, entry);
    }
  });

  return map;
}

function buildHackathonMembers(teamData, participantMap) {
  const memberIds = Array.isArray(teamData?.member_ids) ? teamData.member_ids : [];

  const membersFromParticipants = memberIds
    .map((memberId) => participantMap.get(asTrimmedString(memberId)))
    .filter(Boolean)
    .map((participant) =>
      toParticipantFromDoc(participant, {
        state: teamData?.state || null,
      })
    )
    .filter(Boolean);

  if (membersFromParticipants.length > 0) {
    return membersFromParticipants;
  }

  const inlineMembers = Array.isArray(teamData?.members) ? teamData.members : [];
  return inlineMembers.map((member) => ({
    participant_id: null,
    name: member?.name || null,
    email: member?.email || null,
    phone: member?.phone || null,
    roll: member?.roll || member?.roll_number || null,
    branch: member?.branch || member?.department || null,
    year_of_study: member?.year_of_study || member?.yearOfStudy || null,
    state: member?.state || teamData?.state || null,
  }));
}

export async function loadAdminRegistrationsFromClient(db) {
  const transactionsSnapshot = await getDocs(
    query(collection(db, "transactions"), orderBy("created_at", "desc"))
  );

  const transactions = transactionsSnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  const workshopRegistrationIds = transactions
    .filter((transaction) => transaction?.registration_type === "workshop")
    .map((transaction) => transaction?.registration_ref);

  const hackathonRegistrationIds = transactions
    .filter((transaction) => transaction?.registration_type === "hackathon")
    .map((transaction) => transaction?.registration_ref);

  const [workshopMap, hackathonMap] = await Promise.all([
    loadDocsById(db, "workshop_registrations", workshopRegistrationIds),
    loadDocsById(db, "hackathon_registrations", hackathonRegistrationIds),
  ]);

  const participantIds = [];

  workshopMap.forEach((workshopRegistration) => {
    participantIds.push(workshopRegistration?.participant_id);
  });

  hackathonMap.forEach((hackathonRegistration) => {
    const memberIds = Array.isArray(hackathonRegistration?.member_ids)
      ? hackathonRegistration.member_ids
      : [];
    memberIds.forEach((memberId) => participantIds.push(memberId));
  });

  const participantMap = await loadDocsById(db, "participants", participantIds);

  return transactions.map((transaction) => {
    const registrationType = transaction?.registration_type;
    const registrationRef = asTrimmedString(transaction?.registration_ref);

    if (registrationType === "workshop") {
      const workshopRegistration = workshopMap.get(registrationRef);
      const participantId = asTrimmedString(workshopRegistration?.participant_id);
      const participantFromDoc = participantMap.get(participantId);

      const participant = toParticipantFromDoc(participantFromDoc, {
        branch: workshopRegistration?.branch || workshopRegistration?.department || null,
        year_of_study: workshopRegistration?.year_of_study || workshopRegistration?.yearOfStudy || null,
        state: workshopRegistration?.state || null,
      });

      return {
        transaction_id: transaction?.transaction_id || transaction?.id,
        registration_ref: registrationRef || null,
        registration_type: "workshop",
        status: transaction?.status || "pending",
        amount: transaction?.amount || null,
        upi_transaction_id: transaction?.upi_transaction_id || null,
        screenshot_url: transaction?.screenshot_url || null,
        created_at: toIsoString(transaction?.created_at),
        verified_at: toIsoString(transaction?.verified_at),
        registration: {
          workshop_id: registrationRef || workshopRegistration?.id || null,
          participant: participant
            ? {
                ...participant,
                college: workshopRegistration?.college || null,
              }
            : {
                name: null,
                email: null,
                phone: null,
                roll: null,
                branch: workshopRegistration?.branch || workshopRegistration?.department || null,
                year_of_study:
                  workshopRegistration?.year_of_study || workshopRegistration?.yearOfStudy || null,
                state: workshopRegistration?.state || null,
                college: workshopRegistration?.college || null,
              },
        },
      };
    }

    if (registrationType === "hackathon") {
      const hackathonRegistration = hackathonMap.get(registrationRef);
      const members = buildHackathonMembers(hackathonRegistration, participantMap);
      const rawAccessCredentials = hackathonRegistration?.access_credentials || null;

      const accessCredentials = rawAccessCredentials || hackathonRegistration?.team_access_id
        ? {
            team_id:
              hackathonRegistration?.team_access_id || rawAccessCredentials?.team_id || null,
            leader_name: rawAccessCredentials?.leader_name || null,
            leader_email: rawAccessCredentials?.leader_email || null,
            leader_phone: rawAccessCredentials?.leader_phone || null,
            auth_uid:
              hackathonRegistration?.team_lead_auth_uid || rawAccessCredentials?.auth_uid || null,
            password_version: Number(rawAccessCredentials?.password_version || 0) || null,
            generated_at: toIsoString(rawAccessCredentials?.generated_at),
            updated_at: toIsoString(rawAccessCredentials?.updated_at),
            email_delivery: rawAccessCredentials?.email_delivery || null,
          }
        : null;

      return {
        transaction_id: transaction?.transaction_id || transaction?.id,
        registration_ref: registrationRef || null,
        registration_type: "hackathon",
        status: transaction?.status || "pending",
        amount: transaction?.amount || null,
        upi_transaction_id: transaction?.upi_transaction_id || null,
        screenshot_url: transaction?.screenshot_url || null,
        created_at: toIsoString(transaction?.created_at),
        verified_at: toIsoString(transaction?.verified_at),
        registration: {
          team_id: registrationRef || hackathonRegistration?.id || null,
          team_name: hackathonRegistration?.team_name || null,
          college: hackathonRegistration?.college || null,
          state: hackathonRegistration?.state || null,
          team_size: hackathonRegistration?.team_size || members.length || null,
          members,
          access_credentials: accessCredentials,
        },
      };
    }

    return {
      transaction_id: transaction?.transaction_id || transaction?.id,
      registration_ref: registrationRef || null,
      registration_type: registrationType || null,
      status: transaction?.status || "pending",
      amount: transaction?.amount || null,
      upi_transaction_id: transaction?.upi_transaction_id || null,
      screenshot_url: transaction?.screenshot_url || null,
      created_at: toIsoString(transaction?.created_at),
      verified_at: toIsoString(transaction?.verified_at),
      registration: null,
    };
  });
}

export async function updatePaymentStatusFromClient(db, {
  transactionId,
  registrationType,
  registrationRefId,
  status,
  verifierUid,
}) {
  const transactionKey = asTrimmedString(transactionId);
  const registrationKey = asTrimmedString(registrationRefId);
  const normalizedType = asTrimmedString(registrationType).toLowerCase();

  if (!transactionKey) {
    throw new Error("Missing transaction ID for status update.");
  }

  if (!registrationKey) {
    throw new Error("Missing registration reference for status update.");
  }

  const registrationCollection =
    normalizedType === "workshop"
      ? "workshop_registrations"
      : normalizedType === "hackathon"
      ? "hackathon_registrations"
      : null;

  if (!registrationCollection) {
    throw new Error("Unsupported registration type for status update.");
  }

  const verifiedBy = asTrimmedString(verifierUid) || null;

  await Promise.all([
    updateDoc(doc(db, "transactions", transactionKey), {
      status,
      verified_by: verifiedBy,
      verified_at: serverTimestamp(),
    }),
    updateDoc(doc(db, registrationCollection, registrationKey), {
      payment_verified: status === "verified",
    }),
  ]);
}
