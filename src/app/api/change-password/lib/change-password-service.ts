import bcrypt from "bcryptjs";
import { getUserPasswordHash, updateUserPasswordHash } from "@/app/api/change-password/lib/change-password-repository";

export async function validateCurrentPassword(userId: string, currentPassword: string): Promise<boolean | null> {
  const storedHash = await getUserPasswordHash(userId);
  if (!storedHash) {
    return null;
  }

  return bcrypt.compare(currentPassword, storedHash);
}

export async function changeUserPassword(userId: string, newPassword: string): Promise<void> {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateUserPasswordHash(userId, hashedPassword);
}
