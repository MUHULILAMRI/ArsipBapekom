import { prisma } from "../lib/prisma";

type NotificationType =
  | "ARCHIVE_CREATED"
  | "ARCHIVE_UPDATED"
  | "ARCHIVE_DELETED"
  | "INFO";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification for a specific user
 */
export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link || null,
    },
  });
}

/**
 * Send notifications to all admins and super admins
 */
export async function notifyAdmins(
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  excludeUserId?: string
) {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ["SUPER_ADMIN", "ADMIN"] },
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true },
  });

  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type,
      title,
      message,
      link: link || null,
    })),
  });
}

/**
 * Send notification to users in a specific division
 */
export async function notifyDivision(
  division: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  excludeUserId?: string
) {
  const users = await prisma.user.findMany({
    where: {
      division: division as any,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true },
  });

  if (users.length === 0) return;

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type,
      title,
      message,
      link: link || null,
    })),
  });
}
