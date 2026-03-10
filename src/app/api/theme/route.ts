import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

// GET /api/theme - get current theme config (public for all authenticated users)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let theme = await prisma.themeConfig.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    // Return default theme if none exists
    if (!theme) {
      theme = await prisma.themeConfig.create({
        data: {
          mode: "light",
          primaryColor: "#3b82f6",
          accentColor: "#6366f1",
          sidebarStyle: "dark",
          borderRadius: "rounded",
        },
      });
    }

    return NextResponse.json(theme);
  } catch (error) {
    console.error("Error fetching theme:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/theme - update theme (SUPER_ADMIN only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Hanya Super Admin yang bisa mengatur tema" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { mode, primaryColor, accentColor, sidebarStyle, borderRadius } = body;

    // Validate inputs
    const validModes = ["light", "dark", "system"];
    const validSidebarStyles = ["dark", "light"];
    const validBorderRadius = ["sharp", "rounded", "pill"];

    if (mode && !validModes.includes(mode)) {
      return NextResponse.json({ error: "Mode tidak valid" }, { status: 400 });
    }
    if (sidebarStyle && !validSidebarStyles.includes(sidebarStyle)) {
      return NextResponse.json({ error: "Style sidebar tidak valid" }, { status: 400 });
    }
    if (borderRadius && !validBorderRadius.includes(borderRadius)) {
      return NextResponse.json({ error: "Border radius tidak valid" }, { status: 400 });
    }

    // Get existing or create
    let theme = await prisma.themeConfig.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    const updateData: any = {};
    if (mode) updateData.mode = mode;
    if (primaryColor) updateData.primaryColor = primaryColor;
    if (accentColor) updateData.accentColor = accentColor;
    if (sidebarStyle) updateData.sidebarStyle = sidebarStyle;
    if (borderRadius) updateData.borderRadius = borderRadius;

    if (theme) {
      theme = await prisma.themeConfig.update({
        where: { id: theme.id },
        data: updateData,
      });
    } else {
      theme = await prisma.themeConfig.create({
        data: {
          mode: mode || "light",
          primaryColor: primaryColor || "#3b82f6",
          accentColor: accentColor || "#6366f1",
          sidebarStyle: sidebarStyle || "dark",
          borderRadius: borderRadius || "rounded",
        },
      });
    }

    return NextResponse.json(theme);
  } catch (error) {
    console.error("Error updating theme:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
