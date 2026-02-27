import { NextResponse } from "next/server";
import { clearCookieHeader } from "@/lib/cookies";

export async function POST() {
  const cookie = clearCookieHeader("token", { path: "/", httpOnly: true });

  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Set-Cookie": cookie,
      },
    }
  );
}
