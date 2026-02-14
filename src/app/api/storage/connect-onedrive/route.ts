import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, canManageStorage } from "../../../../lib/rbac";
import {
  getOneDriveAuthUrl,
  handleOneDriveCallback,
} from "../../../../lib/onedrive";

// GET /api/storage/connect-onedrive - Get OneDrive OAuth URL
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canManageStorage(user.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const url = getOneDriveAuthUrl();
  return NextResponse.json({ url });
}

// POST /api/storage/connect-onedrive - Handle OneDrive OAuth Callback
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageStorage(user.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Authorization code is required" }, { status: 400 });
  }

  try {
    const result = await handleOneDriveCallback(code);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
