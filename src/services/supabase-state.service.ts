import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppSnapshot } from "@/types";

export interface SnapshotAdapter {
  load(): Promise<AppSnapshot | null>;
  save(snapshot: AppSnapshot): Promise<void>;
}

/**
 * Demonstration adapter: profile and event data stay in this browser only.
 * The Supabase adapter remains available for a later production switch.
 */
export function createLocalSnapshotAdapter(userId: string): SnapshotAdapter {
  const storageKey = `homesense-demo-snapshot:v1:${userId}`;
  const legacyStorageKey = `homesense-demo-snapshot:${userId}`;
  return {
    async load() {
      const value =
        window.localStorage.getItem(storageKey) ??
        window.localStorage.getItem(legacyStorageKey);
      if (!value) return null;
      try {
        const parsed = JSON.parse(value) as
          | AppSnapshot
          | { version: number; snapshot: AppSnapshot };
        return "snapshot" in parsed ? parsed.snapshot : parsed;
      } catch {
        window.localStorage.removeItem(storageKey);
        window.localStorage.removeItem(legacyStorageKey);
        return null;
      }
    },
    async save(snapshot) {
      const value = JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        snapshot,
      });
      window.localStorage.setItem(storageKey, value);

      // Read-after-write turns browser quota/privacy failures into a visible
      // save error instead of incorrectly showing a success message.
      if (window.localStorage.getItem(storageKey) !== value) {
        throw new Error("Browser storage verification failed");
      }
      window.localStorage.removeItem(legacyStorageKey);
    },
  };
}

export function createSupabaseSnapshotAdapter(
  client: SupabaseClient,
  userId: string,
  email: string,
): SnapshotAdapter {
  return {
    async load() {
      const { data, error } = await client
        .from("app_snapshots")
        .select("snapshot")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data?.snapshot as AppSnapshot | undefined) ?? null;
    },
    async save(snapshot) {
      const { error } = await client.from("app_snapshots").upsert(
        {
          user_id: userId,
          email,
          snapshot,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;
    },
  };
}
