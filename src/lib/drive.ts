import { google } from "googleapis";
import { prisma } from "./prisma";
import { getDivisionFolderName } from "../utils/folderHelper";

const ROOT_FOLDER_NAME = "Root Arsip";

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

async function getAuthenticatedDrive() {
  const config = await prisma.storageConfig.findFirst({
    where: { provider: "google", isActive: true },
  });

  if (!config) throw new Error("Google Drive belum dikonfigurasi");

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: config.accessToken,
    refresh_token: config.refreshToken,
  });

  // Refresh token if expired
  if (config.expiresAt && new Date() > config.expiresAt) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await prisma.storageConfig.update({
      where: { id: config.id },
      data: {
        accessToken: credentials.access_token!,
        refreshToken: credentials.refresh_token ?? config.refreshToken,
        expiresAt: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : null,
      },
    });
    oauth2Client.setCredentials(credentials);
  }

  return google.drive({ version: "v3", auth: oauth2Client });
}

async function findFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId?: string
): Promise<string | null> {
  const query = parentId
    ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const res = await drive.files.list({ q: query, fields: "files(id, name)" });
  return res.data.files?.[0]?.id ?? null;
}

async function createFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId?: string
): Promise<string> {
  const fileMetadata: any = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentId) fileMetadata.parents = [parentId];

  const res = await drive.files.create({
    requestBody: fileMetadata,
    fields: "id",
  });

  return res.data.id!;
}

async function getOrCreateRootFolder(
  drive: ReturnType<typeof google.drive>
): Promise<string> {
  const existing = await findFolder(drive, ROOT_FOLDER_NAME);
  if (existing) return existing;
  return createFolder(drive, ROOT_FOLDER_NAME);
}

async function getOrCreateDivisionFolder(
  drive: ReturnType<typeof google.drive>,
  division: string
): Promise<string> {
  const rootId = await getOrCreateRootFolder(drive);
  const folderName = getDivisionFolderName(division);

  const existing = await findFolder(drive, folderName, rootId);
  if (existing) return existing;
  return createFolder(drive, folderName, rootId);
}

export async function uploadToDrive(
  file: { name: string; type: string; buffer: Buffer },
  division: string
) {
  const drive = await getAuthenticatedDrive();
  const folderId = await getOrCreateDivisionFolder(drive, division);

  const { Readable } = await import("stream");
  const stream = new Readable();
  stream.push(file.buffer);
  stream.push(null);

  const uploadedFile = await drive.files.create({
    requestBody: {
      name: file.name,
      parents: [folderId],
    },
    media: {
      mimeType: file.type,
      body: stream,
    },
    fields: "id",
  });

  // Make file viewable by anyone with link
  await drive.permissions.create({
    fileId: uploadedFile.data.id!,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return {
    fileId: uploadedFile.data.id!,
    fileUrl: `https://drive.google.com/file/d/${uploadedFile.data.id}/view`,
  };
}

export function getGoogleAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
    prompt: "consent",
  });
}

export async function handleGoogleCallback(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  // Deactivate existing Google configs
  await prisma.storageConfig.updateMany({
    where: { provider: "google" },
    data: { isActive: false },
  });

  await prisma.storageConfig.create({
    data: {
      provider: "google",
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      isActive: true,
    },
  });

  return { success: true };
}
