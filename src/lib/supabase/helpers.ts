import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Fetch profiles for a list of user IDs.
 * Returns a map of userId -> { id, full_name, username }.
 * Uses service role client (no RLS issues).
 */
export async function getProfilesByIds(
  userIds: string[]
): Promise<
  Record<string, { id: string; full_name: string | null; username: string | null }>
> {
  if (userIds.length === 0) return {};

  const db = createServiceRoleClient();
  const { data } = await db
    .from("profiles")
    .select("id, full_name, username")
    .in("id", userIds);

  const map: Record<
    string,
    { id: string; full_name: string | null; username: string | null }
  > = {};
  for (const p of data || []) {
    map[p.id] = p;
  }
  return map;
}

/**
 * Fetch client names for a list of client IDs.
 * Returns a map of clientId -> name.
 */
export async function getClientNamesByIds(
  clientIds: string[]
): Promise<Record<string, string>> {
  if (clientIds.length === 0) return {};

  const db = createServiceRoleClient();
  const { data } = await db
    .from("clients")
    .select("id, name")
    .in("id", clientIds);

  const map: Record<string, string> = {};
  for (const c of data || []) {
    map[c.id] = c.name;
  }
  return map;
}
