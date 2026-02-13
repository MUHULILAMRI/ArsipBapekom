import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, canManageStorage } from "../../../../lib/rbac";
import { getGoogleAuthUrl, handleGoogleCallback } from "../../../../lib/drive";

// GET /api/storage/connect-google - Get Google OAuth URL
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canManageStorage(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = getGoogleAuthUrl();
  return NextResponse.json({ url });
}

// POST /api/storage/connect-google - Handle Google OAuth Callback
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageStorage(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  try {
    const result = await handleGoogleCallback(code);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
