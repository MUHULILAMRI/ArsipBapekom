import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER" | "PEMINJAM";

interface SessionUser {
  id: string;
  role: UserRole;
  division: string;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as unknown as SessionUser;
}

export function canAccessDivision(
  userRole: UserRole,
  userDivision: string,
  targetDivision: string
): boolean {
  if (userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "PEMINJAM") return true;
  return userDivision === targetDivision;
}

export function canManageUsers(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

export function canManagePeminjam(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canManageStorage(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canCreateArchive(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "USER";
}

export function canDeleteArchive(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canEditArchive(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canBorrow(role: UserRole): boolean {
  return true; // All roles can borrow
}

export function isPeminjam(role: UserRole): boolean {
  return role === "PEMINJAM";
}

export function isStaff(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "USER";
}
