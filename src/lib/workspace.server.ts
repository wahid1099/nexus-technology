import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type SnapshotThread = {
  id: string;
  name: string;
  channel: string;
  status: string;
  intent: string;
  confidence: number;
  created_at: string;
  messages: { from: "customer" | "ai"; text: string }[];
  meta: [string, string][];
};
export type RangeStats = { count: number; resolution: number; response: number; csat: number };
export type WorkspaceSnapshot = {
  threads: SnapshotThread[];
  analytics: { "7 days": RangeStats; "30 days": RangeStats; "90 days": RangeStats; daily: { day: string; value: number }[] };
  orders: { number: string; status: string; expected: string | null }[];
  knowledge: { title: string; body: string }[];
};

/** Reads the anonymised snapshot with the public key (no admin access). */
export async function fetchWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await client.rpc("public_workspace_snapshot");
  if (error) throw error;
  return data as unknown as WorkspaceSnapshot;
}
