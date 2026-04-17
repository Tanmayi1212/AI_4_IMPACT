import { NextResponse } from "next/server";
import { adminDb } from "../../../../../lib/admin";
import { PHASES } from "../../../../../lib/constants/phases";
import { verifyRequestWithProfile } from "../../../../../lib/server/auth";
import { getHackathonConfig } from "../../../../../lib/server/hackathon";

export const dynamic = "force-dynamic"; // Use dynamic to ensure fresh fetch

export async function GET(request) {
  try {
    const { authUser, profile } = await verifyRequestWithProfile(request);
    if (!authUser || !profile) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const config = await getHackathonConfig();
    const isSelectionActive = config.currentPhase === PHASES.PS_SELECTION;
    
    // Even if it's frozen, we may want to show the list but frozen.
    // If it's not reached yet, we return empty or an indicator that it's soon.
    if (!isSelectionActive && config.currentPhase !== PHASES.HACKATHON) {
       // if we are before PS_SELECTION, say phase is not active
       return NextResponse.json({ success: true, active: false, statements: [] });
    }

    const psSnap = await adminDb.collection("problem_statements").orderBy("problemId", "asc").get();
    
    const statements = psSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        problemId: data.problemId || doc.id,
        title: data.title || "Unknown Statement",
        shortDescription: data.shortDescription || data.description?.substring(0, 80) + "..." || "",
        description: data.description || "",
        selectedCount: data.selectedCount || 0,
        maxLimit: 5
      };
    });

    return NextResponse.json({ 
      success: true, 
      active: !config.psSelectionLocked,
      statements
    });

  } catch (err) {
    console.error("Fetch Problem Statements Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load problem statements." },
      { status: 500 }
    );
  }
}
