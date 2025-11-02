export type AppRole =
  | "CREATOR"
  | "ADMIN"
  | "MEMBER"
  | "READER"
  | undefined
  | null;

export const roleWeight: Record<string, number> = {
  READER: 1,
  MEMBER: 2,
  ADMIN: 3,
  CREATOR: 4,
};

export function can(
  current: AppRole,
  required: keyof typeof roleWeight,
): boolean {
  if (!current) return false;
  const cur = roleWeight[current] ?? 0;
  const req = roleWeight[required] ?? 0;
  return cur >= req;
}
