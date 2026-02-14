import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/rbac";
import { uploadFile } from "../../../utils/uploadHelper";
import { checkRateLimit } from "../../../lib/rateLimit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Rate limit uploads: max 10 per minute per user
  const rateCheck = checkRateLimit(`upload:${user.id}`, {
    maxRequests: 10,
    windowSeconds: 60,
  });
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait before uploading again." },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const division = formData.get("division") as string;

    if (!file || !division) {
      return NextResponse.json(
        { error: "File and division are required" },
        { status: 400 }
      );
    }

    // Validate division
    const validDivisions = ["KEUANGAN", "PENYELENGGARA", "TATA_USAHA", "UMUM"];
    if (!validDivisions.includes(division)) {
      return NextResponse.json(
        { error: "Invalid division" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Validate file type (whitelist allowed types)
    const ALLOWED_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Accepted: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, WebP" },
        { status: 400 }
      );
    }

    // Validate filename - prevent path traversal
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    if (safeName.includes("..") || safeName.startsWith("/")) {
      return NextResponse.json(
        { error: "Invalid file name" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadFile(
      {
        name: safeName,
        type: file.type,
        buffer,
      },
      division
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
