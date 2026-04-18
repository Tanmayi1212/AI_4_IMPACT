import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "../../../../../lib/admin";
import { ROLES, ROLE_LIST } from "../../../../../lib/constants/roles";
import { verifyRequestUser } from "../../../../../lib/server/auth";

export const dynamic = "force-static";

function clean(value) {
  return String(value || "").trim();
}

export async function PATCH(request) {
  try {
    const authUser = await verifyRequestUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const requestedRole = clean(body?.role).toUpperCase();
    const college = clean(body?.college);
    const phone = clean(body?.phone);
    const fullName = clean(body?.fullName);

    if (requestedRole && !ROLE_LIST.includes(requestedRole)) {
      return NextResponse.json({ success: false, error: "Invalid role." }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(authUser.uid);
    const userDoc = await userRef.get();
    const currentRole = clean(userDoc.data()?.role).toUpperCase();
    const isPrivilegedRoleWriter = authUser.isAdminClaim === true || authUser.isAdminEmail === true;

    if (!isPrivilegedRoleWriter && requestedRole) {
      const isSafeInitialRole = !currentRole && requestedRole === ROLES.PARTICIPANT;
      const isUnchangedRole = currentRole && requestedRole === currentRole;

      if (!isSafeInitialRole && !isUnchangedRole) {
        return NextResponse.json(
          { success: false, error: "Role updates require admin privileges." },
          { status: 403 }
        );
      }
    }

    const role = isPrivilegedRoleWriter
      ? (requestedRole || currentRole || ROLES.PARTICIPANT)
      : (currentRole || requestedRole || ROLES.PARTICIPANT);

    await userRef.set(
      {
        uid: authUser.uid,
        email: authUser.email || "",
        role,
        college,
        phone,
        fullName,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update user profile." },
      { status: 500 }
    );
  }
}
