import { uploadToDrive } from "../lib/drive";
import { uploadToOneDrive } from "../lib/onedrive";
import { prisma } from "../lib/prisma";

export type StorageProvider = "google" | "onedrive";

async function getActiveStorageProvider(): Promise<StorageProvider> {
  const config = await prisma.storageConfig.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!config) throw new Error("No storage has been configured. Please set up Google Drive or OneDrive first.");
  return config.provider as StorageProvider;
}

export async function uploadFile(
  file: { name: string; type: string; buffer: Buffer },
  division: string,
  year?: string
): Promise<{ fileId: string; fileUrl: string }> {
  const provider = await getActiveStorageProvider();

  if (provider === "google") {
    return uploadToDrive(file, division, year);
  } else {
    return uploadToOneDrive(file, division, year);
  }
}
