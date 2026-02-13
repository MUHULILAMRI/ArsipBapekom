import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, canManageStorage } from "../../../../lib/rbac";
import { getGoogleAuthUrl, handleGoogleCallback } from "../../../../lib/drive";

// GET /api/storage/connect-google - Get Google OAuth URL or handle callback
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  // If code is present, this is a callback from Google
  if (code) {
    try {
      await handleGoogleCallback(code);
      // Redirect to admin storage page with success message
      const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
      return NextResponse.redirect(
        `${baseUrl}/admin/storage?connected=google`
      );
    } catch (error: any) {
      const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
      return NextResponse.redirect(
        `${baseUrl}/admin/storage?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // Otherwise, generate OAuth URL
  const user = await getCurrentUser();
  if (!user || !canManageStorage(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = getGoogleAuthUrl();
  return NextResponse.json({ url });
}
