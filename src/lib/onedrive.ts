import { Client } from "@microsoft/microsoft-graph-client";
import { prisma } from "./prisma";
import { getDivisionFolderName } from "../utils/folderHelper";

const ROOT_FOLDER_NAME = "Root Arsip";

async function getGraphClient(): Promise<Client> {
  const config = await prisma.storageConfig.findFirst({
    where: { provider: "onedrive", isActive: true },
  });

  if (!config) throw new Error("OneDrive belum dikonfigurasi");

  // Refresh token if expired
  if (config.expiresAt && new Date() > config.expiresAt) {
    const tokenResponse = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          refresh_token: config.refreshToken,
          grant_type: "refresh_token",
          scope: "Files.ReadWrite.All offline_access",
        }),
      }
    );

    const tokens = await tokenResponse.json();

    await prisma.storageConfig.update({
      where: { id: config.id },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? config.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    config.accessToken = tokens.access_token;
  }

  return Client.init({
    authProvider: (done) => {
      done(null, config.accessToken);
    },
  });
}

async function getOrCreateFolder(
  client: Client,
  folderName: string,
  parentPath: string = "/me/drive/root"
): Promise<string> {
  try {
    const result = await client
      .api(`${parentPath}/children`)
      .filter(`name eq '${folderName}'`)
      .get();

    if (result.value && result.value.length > 0) {
      return result.value[0].id;
    }
  } catch {
    // Folder not found, create it
  }

  const folder = await client.api(`${parentPath}/children`).post({
    name: folderName,
    folder: {},
    "@microsoft.graph.conflictBehavior": "fail",
  });

  return folder.id;
}

export async function uploadToOneDrive(
  file: { name: string; type: string; buffer: Buffer },
  division: string,
  year?: string
) {
  const client = await getGraphClient();

  // Get or create root folder
  const rootFolderId = await getOrCreateFolder(client, ROOT_FOLDER_NAME);

  // Get or create division folder
  const divisionFolderName = getDivisionFolderName(division);
  const divisionFolderId = await getOrCreateFolder(
    client,
    divisionFolderName,
    `/me/drive/items/${rootFolderId}`
  );

  // Get or create year folder if year is provided
  let targetFolderId = divisionFolderId;
  if (year) {
    targetFolderId = await getOrCreateFolder(
      client,
      year,
      `/me/drive/items/${divisionFolderId}`
    );
  }

  // Upload file
  const uploadedFile = await client
    .api(`/me/drive/items/${targetFolderId}:/${file.name}:/content`)
    .putStream(file.buffer);

  // Create sharing link
  const shareLink = await client
    .api(`/me/drive/items/${uploadedFile.id}/createLink`)
    .post({ type: "view", scope: "anonymous" });

  return {
    fileId: uploadedFile.id,
    fileUrl: shareLink.link.webUrl,
  };
}

export function getOneDriveAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: "code",
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
    scope: "Files.ReadWrite.All offline_access",
    response_mode: "query",
  });

  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
}

export async function handleOneDriveCallback(code: string) {
  const tokenResponse = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    }
  );

  const tokens = await tokenResponse.json();

  // Deactivate existing OneDrive configs
  await prisma.storageConfig.updateMany({
    where: { provider: "onedrive" },
    data: { isActive: false },
  });

  await prisma.storageConfig.create({
    data: {
      provider: "onedrive",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      isActive: true,
    },
  });

  return { success: true };
}
