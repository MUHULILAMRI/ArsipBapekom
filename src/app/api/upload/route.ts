import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/rbac";
import { uploadFile } from "../../../utils/uploadHelper";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const division = formData.get("division") as string;

    if (!file || !division) {
      return NextResponse.json(
        { error: "File dan divisi wajib diisi" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadFile(
      {
        name: file.name,
        type: file.type,
        buffer,
      },
      division
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload gagal" },
      { status: 500 }
    );
  }
}
