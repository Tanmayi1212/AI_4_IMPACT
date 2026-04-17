const ENV = globalThis?.process?.env || {};

export const PROBLEM_STATEMENT_SELECTION_COLLECTION = "team_problem_selection";
export const PROBLEM_STATEMENT_CAPACITY_COLLECTION = "problem_statement_capacity";
export const PROBLEM_STATEMENT_CAPACITY_DOC_ID = "global";

const DEFAULT_MAX_TEAMS_PER_PROBLEM = 7;

const STATIC_PROBLEM_STATEMENTS = Object.freeze([
  {
    id: "PS001",
    title: "Elderly Risk Prediction, Support and Care System",
    description: [
      "Caregivers and families often struggle to identify emotional distress, health deterioration, and emergency risk early in elderly individuals.",
      "Use cases include real-time emotion detection from facial expressions, sentiment analysis for well-being, wearable health-data analysis, multilingual chatbot guidance, predictive alerts, and personalized care suggestions.",
    ].join("\n\n"),
    category: "Healthcare",
  },
  {
    id: "PS002",
    title: "Intelligent Real-Time Blood Donation & Alerting System",
    description: [
      "Medical emergencies are delayed when donor availability is not tracked in real time and matching is done manually.",
      "Use cases include AI-based donor matching by blood group, location, and availability, instant alerts to donors/hospitals/blood banks, response-likelihood prediction, and optimized allocation for faster emergency response.",
    ].join("\n\n"),
    category: "Healthcare",
  },
  {
    id: "PS003",
    title: "Smart Care Assistance for New Mothers and Pregnant Women",
    description: [
      "Pregnant women and new mothers often lack continuous support for newborn care, routines, and health decisions.",
      "Use cases include baby routine and growth tracking, vaccination reminders, personalized diet plans for mother and infant, first-aid guidance, and chatbot-based support for accessible day-to-day care.",
    ].join("\n\n"),
    category: "Healthcare",
  },
  {
    id: "PS004",
    title: "3D Sign Language Interpreter Platform",
    description: [
      "People with hearing and speech impairments still face strong communication barriers in services and digital interactions.",
      "Use cases include converting spoken or written language into real-time 3D sign animations, optionally converting sign input back to text/speech, and enabling scalable cross-device communication between signers and non-signers.",
    ].join("\n\n"),
    category: "Accessibility",
  },
  {
    id: "PS005",
    title: "ArtisanConnect: Bridging Local Talent with Learners",
    description: [
      "Local artisans often lack digital visibility and structured channels to teach or monetize skills, causing traditional craft knowledge to fade.",
      "Use cases include smart artisan-learner matching by interests and location, personalized discovery, intelligent profiling for course pathways, and adaptive learning flows that support local craftsmanship growth.",
    ].join("\n\n"),
    category: "Social",
  },
  {
    id: "PS006",
    title: "Agentic Public Grievance Intelligence System",
    description: [
      "Public grievances are spread across disconnected channels, which slows prioritization and response quality in governance workflows.",
      "Use cases include collaborative AI agents that ingest multimodal complaints, classify and prioritize by urgency, detect root causes through cross-source analysis, and trigger action-oriented resolution workflows.",
    ].join("\n\n"),
    category: "Governance",
  },
  {
    id: "PS007",
    title: "AI-Powered Smart Expenditure Planner & Investment Advisor",
    description: [
      "Personal finance decisions are hard when spending, savings, and investment signals are fragmented across multiple sources.",
      "Use cases include expense tracking and categorization, spending-pattern analysis, personalized investment suggestions based on risk and income behavior, and real-time alerts with forward-looking financial-health insights.",
    ].join("\n\n"),
    category: "Finance",
  },
  {
    id: "PS008",
    title: "Agentic Healthcare Triage Assistant",
    description: [
      "Hospitals and care networks face triage overload when case inputs arrive from many channels and severity is not consistently prioritized.",
      "Use cases include ingesting symptoms/history, severity-based case prioritization, routing to appropriate providers, recommending next steps like tests or consultations, and outcome-driven learning to improve triage quality over time.",
    ].join("\n\n"),
    category: "Healthcare",
  },
  {
    id: "PS009",
    title: "Agentic Factory Operations Manager",
    description: [
      "Factories generate rich machine and operator data, yet operations are often reactive and breakdowns are handled late.",
      "Use cases include continuous anomaly detection, breakdown-risk alerts, root-cause analysis using historical patterns, and recommended or automated corrective actions such as maintenance or load balancing.",
    ].join("\n\n"),
    category: "Industry",
  },
  {
    id: "PS010",
    title: "Agentic Production Planning System",
    description: [
      "Production plans frequently break when downtime, shortages, or demand changes are not absorbed in real time.",
      "Use cases include dynamic schedule generation from demand and inventory signals, live re-planning during delays/shortages, and cross-team coordination with procurement and logistics for cost and resource optimization.",
    ].join("\n\n"),
    category: "Industry",
  },
  {
    id: "PS011",
    title: "Unified Grievance Intelligence Agent",
    description: [
      "Citizen complaints arrive through social media, emails, and physical channels, which creates fragmented tracking and delayed response.",
      "Use cases include multimodal ingestion (text/images/scanned docs), clustering similar complaints to identify patterns, and dynamic prioritization by impact and frequency with minimal manual intervention.",
    ].join("\n\n"),
    category: "Governance",
  },
  {
    id: "PS012",
    title: "Intelligent Food Rescue & Redistribution System",
    description: [
      "Large amounts of surplus food from restaurants, events, and households are wasted every day, while many people in orphanages and shelters face food insecurity due to missing donor-recipient coordination.",
      "Use cases include real-time surplus-food listing, location-based donor-recipient matching, urgency and expiry-time prioritization, basic route optimization, notifications, impact tracking (meals saved and waste reduced), and mapping integration for logistics.",
    ].join("\n\n"),
    category: "Social",
  },
  {
    id: "PS013",
    title: "AI-Powered Crop Price Intelligence & Smart Market Linkage Advisor",
    description: [
      "Farmers often lack timely visibility into crop prices and market demand, making it hard to choose where and when to sell and resulting in reduced profits.",
      "Use cases include crop-price prediction with time-series models, ingestion of real-time market data, LLM-driven market recommendations, profit estimation, real-time alerts, and a multilingual dashboard-based interface.",
    ].join("\n\n"),
    category: "Agriculture",
  },
  {
    id: "PS014",
    title: "AI-Powered Local Services & Supply Platform",
    description: [
      "Local workers such as plumbers, electricians, and carpenters often depend on middlemen for jobs and materials, while customers face delays, unclear pricing, and difficulty finding reliable providers.",
      "Use cases include skill- and availability-based worker matching, real-time booking with transparent pricing, integrated materials ordering with pickup/delivery, AI issue analysis for worker/cost/material suggestions, multilingual voice assistance, demand prediction, and trust scoring through reviews and performance.",
    ].join("\n\n"),
    category: "Services",
  },
  {
    id: "PS015",
    title: "Smart Travel Planner",
    description: [
      "Travel planning is often time-consuming because users must manually balance budget, preferences, schedules, and availability, which leads to inefficient trip decisions.",
      "Use cases include personalized itinerary generation, recommendation workflows, route optimization, real-time travel updates, user-preference based planning, API integrations, and fast itinerary computation.",
    ].join("\n\n"),
    category: "Mobility",
  },
]);

function asTrimmedString(value) {
  return String(value || "").trim();
}

function toPositiveInteger(value, fallbackValue) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallbackValue;
  }

  return Math.floor(numeric);
}

function toIsoString(value) {
  if (!value) return null;

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeProblemId(value, fallbackValue = "") {
  const normalized = asTrimmedString(value)
    .toUpperCase()
    .replace(/\s+/g, "_");

  return normalized || fallbackValue;
}

function normalizeProblemStatement(rawStatement, index) {
  const fallbackId = `PS_DEMO_${String(index + 1).padStart(2, "0")}`;
  const id = normalizeProblemId(rawStatement?.id, fallbackId);

  return {
    id,
    title: asTrimmedString(rawStatement?.title || `Problem Statement ${index + 1}`),
    description: asTrimmedString(rawStatement?.description),
    category: asTrimmedString(rawStatement?.category || "General"),
  };
}

export const MAX_TEAMS_PER_PROBLEM = toPositiveInteger(
  ENV.PROBLEM_STATEMENT_MAX_TEAMS_PER_PROBLEM,
  DEFAULT_MAX_TEAMS_PER_PROBLEM
);

export function getProblemStatementCatalog() {
  return STATIC_PROBLEM_STATEMENTS.map((statement, index) =>
    normalizeProblemStatement(statement, index)
  );
}

export function findProblemStatementById(problemId, catalog = getProblemStatementCatalog()) {
  const normalizedProblemId = normalizeProblemId(problemId);
  if (!normalizedProblemId) {
    return null;
  }

  return (
    catalog.find((statement) => statement.id === normalizedProblemId) || null
  );
}

function normalizeCapacityCounts(rawCounts, catalog) {
  const source = rawCounts && typeof rawCounts === "object" ? rawCounts : {};
  const normalized = {};

  for (const statement of catalog) {
    const key = statement.id;
    const count = Number(source[key]);

    normalized[key] =
      Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  }

  return normalized;
}

export function getProblemStatementCapacityRef(adminDb) {
  return adminDb
    .collection(PROBLEM_STATEMENT_CAPACITY_COLLECTION)
    .doc(PROBLEM_STATEMENT_CAPACITY_DOC_ID);
}

export async function readProblemStatementCapacitySnapshot(
  adminDb,
  catalog = getProblemStatementCatalog()
) {
  const capacityRef = getProblemStatementCapacityRef(adminDb);
  const capacityDoc = await capacityRef.get();

  const rawData = capacityDoc.exists ? capacityDoc.data() || {} : {};
  const maxTeamsPerProblem = toPositiveInteger(
    rawData?.max_teams_per_problem,
    MAX_TEAMS_PER_PROBLEM
  );

  return {
    maxTeamsPerProblem,
    counts: normalizeCapacityCounts(rawData?.counts, catalog),
    updatedAt: toIsoString(rawData?.updated_at),
  };
}

export function mapProblemStatementsWithCapacity({
  catalog = getProblemStatementCatalog(),
  capacitySnapshot,
} = {}) {
  const maxTeamsPerProblem = toPositiveInteger(
    capacitySnapshot?.maxTeamsPerProblem,
    MAX_TEAMS_PER_PROBLEM
  );
  const counts = normalizeCapacityCounts(capacitySnapshot?.counts, catalog);

  return catalog.map((statement) => {
    const selectedTeamsCount = counts[statement.id] || 0;
    const availableSlots = Math.max(0, maxTeamsPerProblem - selectedTeamsCount);

    return {
      problem_id: statement.id,
      title: statement.title,
      description: statement.description,
      category: statement.category,
      selected_teams_count: selectedTeamsCount,
      max_teams_allowed: maxTeamsPerProblem,
      available_slots: availableSlots,
      is_full: availableSlots <= 0,
    };
  });
}

function normalizeTeamSelectionRecord(doc, teamId) {
  const data = doc.data() || {};

  return {
    selection_id: doc.id,
    team_id: asTrimmedString(data?.team_id || teamId),
    problem_id: normalizeProblemId(data?.problem_id),
    problem_title: asTrimmedString(data?.problem_title),
    problem_description: asTrimmedString(data?.problem_description),
    selected_at: toIsoString(data?.selected_at || data?.created_at),
    selected_count_at_selection:
      Number.isFinite(Number(data?.selected_count_at_selection))
        ? Number(data?.selected_count_at_selection)
        : null,
    max_teams_allowed_at_selection:
      Number.isFinite(Number(data?.max_teams_allowed_at_selection))
        ? Number(data?.max_teams_allowed_at_selection)
        : null,
  };
}

export async function readTeamProblemSelection(adminDb, teamId) {
  const normalizedTeamId = asTrimmedString(teamId);
  if (!normalizedTeamId) {
    return null;
  }

  const directDoc = await adminDb
    .collection(PROBLEM_STATEMENT_SELECTION_COLLECTION)
    .doc(normalizedTeamId)
    .get();

  if (directDoc.exists) {
    return normalizeTeamSelectionRecord(directDoc, normalizedTeamId);
  }

  const fallbackSnapshot = await adminDb
    .collection(PROBLEM_STATEMENT_SELECTION_COLLECTION)
    .where("team_id", "==", normalizedTeamId)
    .limit(1)
    .get();

  if (fallbackSnapshot.empty) {
    return null;
  }

  return normalizeTeamSelectionRecord(fallbackSnapshot.docs[0], normalizedTeamId);
}

