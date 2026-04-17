const ENV = globalThis?.process?.env || {};

export const PROBLEM_STATEMENT_SELECTION_COLLECTION = "team_problem_selection";
export const PROBLEM_STATEMENT_CAPACITY_COLLECTION = "problem_statement_capacity";
export const PROBLEM_STATEMENT_CAPACITY_DOC_ID = "global";

const DEFAULT_MAX_TEAMS_PER_PROBLEM = 8;

const STATIC_PROBLEM_STATEMENTS = Object.freeze([
  {
    id: "PS001",
    title: "Elderly Risk Prediction, Support and Care System",
    description: "Caregivers and families struggle to proactively identify emotional distress, health deterioration, and emergency situations in elderly individuals. Design an AI-driven Elderly Health & Emotional Monitoring Assistant that integrates real-time emotion detection, health data analysis, and a conversational chatbot interface with multilingual support. The system should leverage OpenCV for facial expressions, sentiment analysis for well-being, and health data from wearables to generate predictive alerts and personalized care suggestions.",
    category: "Healthcare",
  },
  {
    id: "PS002",
    title: "Intelligent Real-Time Blood Donation & Alerting System",
    description: "Delays in identifying donors and a lack of real-time availability tracking in medical emergencies can have life-threatening consequences. Develop an AI-powered platform that enables real-time blood donor matching based on blood group, location, and availability. The system should send instant alerts to donors, hospitals, and blood banks, predict response likelihood, and optimize allocation to ensure rapid response times.",
    category: "Healthcare",
  },
  {
    id: "PS003",
    title: "Smart Care Assistance for New Mothers and Pregnant Women",
    description: "New and pregnant mothers often face challenges managing newborn care without continuous guidance. Build an AI-powered smart care assistant that tracks baby routines, growth, and development, providing vaccination reminders and personalized diet plans for both mother and infant. The platform should offer first-aid guidance and easy interaction via a chatbot, ensuring culturally relevant and culturally tailored care.",
    category: "Healthcare",
  },
  {
    id: "PS004",
    title: "3D Sign Language Interpreter Platform",
    description: "Million of people with hearing and speech impairments face communication barriers in public services and digital platforms. Design a 3D Sign Language Interpreter Platform that translates spoken or written language into accurate, real-time 3D animations, and optionally converts signs back into speech or text. The solution should be scalable and accessible across devices to enable seamless interaction between signers and non-signers.",
    category: "Accessibility",
  },
  {
    id: "PS005",
    title: "ArtisanConnect: Bridging Local Talent with Learners",
    description: "Local artisans lack digital visibility and structured ways to share skills, leading to lost traditional crafts. Develop an AI-powered platform connecting artisans with learners via smart discovery and personalized experiences. Use recommendation agents for matching based on interests and location, include intelligent profiling for course structures, and apply adaptive learning pathways to support the growth of local craftsmanship.",
    category: "Social",
  },
  {
    id: "PS006",
    title: "Agentic Public Grievance Intelligence System",
    description: "Governments struggle to manage grievances across fragmented channels like social media and messaging platforms. Design a system of autonomous, collaborative AI agents that ingest multimodal inputs, classify complaints, and prioritize issues based on urgency. The system should identify root causes through cross-source analysis and trigger actionable resolution workflows, enabling proactive data-driven governance.",
    category: "Governance",
  },
  {
    id: "PS007",
    title: "AI-Powered Smart Expenditure Planner & Investment Advisor",
    description: "Managing daily expenses and making informed investment decisions is difficult due to fragmented financial data. Design an AI advisor that tracks and categorizes expenses, analyzes spending behavior, and generates personalized investment recommendations based on income patterns and risk appetite. The system should provide forward-looking insights and real-time financial health alerts to support long-term wealth creation.",
    category: "Finance",
  },
  {
    id: "PS008",
    title: "Agentic Healthcare Triage Assistant",
    description: "Healthcare systems face overload in triaging patient cases from multiple entry points like calls and reports. Design a collaborative agent system that ingests patient symptoms and history, prioritizes cases based on severity and risk, routes patients to appropriate care providers, and recommends next steps (tests/consultations). The system should learn from outcomes to continuously improve triage accuracy.",
    category: "Healthcare",
  },
  {
    id: "PS009",
    title: "Agentic Factory Operations Manager",
    description: "Manufacturing plants generate massive machine data, but decision-making remains reactive. Design a multi-agent system that continuously monitors machines and operator inputs to detect anomalies and breakdown risks. It should identify root causes using historical data and suggest or trigger corrective actions like maintenance or load balancing to optimize shopfloor efficiency.",
    category: "Industry",
  },
  {
    id: "PS010",
    title: "Agentic Production Planning System",
    description: "Production planning often fails to adapt to real-time machine downtime or demand fluctuations. Build an agentic system that ingests demand forecasts and inventory to dynamically create and update production schedules. It should adjust plans based on delays or shortages and coordinate across procurement and logistics to optimize for cost and resource utilization.",
    category: "Industry",
  },
  {
    id: "PS011",
    title: "Unified Grievance Intelligence Agent",
    description: "Citizens report issues across social media, emails, and physical complaints, leading to delayed responses. Challenge is to design a unified system of collaborative AI agents that ingest inputs from diverse sources (text, images, scanned docs), cluster similar complaints to detect patterns, and dynamically prioritize issues based on societal impact and frequency with minimal human intervention.",
    category: "Governance",
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
