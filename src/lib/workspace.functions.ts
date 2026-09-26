import { createServerFn } from "@tanstack/react-start";
import { fetchWorkspaceSnapshot } from "./workspace.server";

export type { WorkspaceSnapshot } from "./workspace.server";

/** Public, anonymised view of the Nexa workspace for the homepage demo. */
export const getWorkspaceSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return { ok: true as const, snapshot: await fetchWorkspaceSnapshot() };
  } catch (e) {
    console.error("workspace snapshot failed", e);
    return { ok: false as const, snapshot: null };
  }
});
