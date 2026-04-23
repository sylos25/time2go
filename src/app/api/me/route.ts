import { NextResponse } from "next/server";
import { getRequesterIdFromRequest } from "@/lib/auth-request";
import { mapMeRow } from "@/app/api/me/lib/me-mappers";
import { findUserProfileById } from "@/app/api/me/lib/me-repository";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const userId = await getRequesterIdFromRequest(req);
    if (!userId) {
      const message = authHeader.startsWith("Bearer ") ? "Invalid token" : "No authenticated user";
      return NextResponse.json({ ok: false, message }, { status: 401 });
    }

    const user = await findUserProfileById(userId);

    if (!user) {
      return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user: mapMeRow(user) });
  } catch (err) {
    console.error("/api/me error:", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
