import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchWorkspaceSnapshot } from "./workspace.server";

const Input = z.object({
  scenario: z.string().trim().min(5).max(1500),
  tone: z.enum(["Friendly", "Professional", "Empathetic", "Concise"]),
  business: z.string().trim().max(120).optional().default(""),
});

function buildSampleReply(scenario: string, tone: z.infer<typeof Input>["tone"], business: string) {
  const normalized = scenario.toLowerCase();
  const greeting = {
    Friendly: "Hi there, thanks for reaching out!",
    Professional: "Hello, thank you for contacting us.",
    Empathetic: "I'm sorry you're dealing with this.",
    Concise: "Thanks for letting us know.",
  }[tone];
  const supportTeam = business ? `${business} support` : "our support team";

  if (
    normalized.includes("order") ||
    normalized.includes("package") ||
    normalized.includes("deliver")
  ) {
    return `${greeting} I'll check the latest delivery update with ${supportTeam}. Could you share your order number?`;
  }
  if (
    normalized.includes("charge") ||
    normalized.includes("billing") ||
    normalized.includes("subscription")
  ) {
    return `${greeting} I'll review the billing details with ${supportTeam}. Could you share the email on your account and the dates of the charges?`;
  }
  if (
    normalized.includes("return") ||
    normalized.includes("exchange") ||
    normalized.includes("size")
  ) {
    return `${greeting} I can help with a return or exchange. Could you share your order number and preferred option?`;
  }
  return `${greeting} I'll look into this with ${supportTeam} and follow up with the best next step. Could you share any relevant order or account details?`;
}

export const generateReply = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) {
      return {
        ok: true as const,
        reply: buildSampleReply(data.scenario, data.tone, data.business),
        sample: true as const,
      };
    }

    let facts = "";
    try {
      const snap = await fetchWorkspaceSnapshot();
      const orders = snap.orders
        .map(
          (o) => `- Order ${o.number}: ${o.status}${o.expected ? `, expected ${o.expected}` : ""}`,
        )
        .join("\n");
      const kb = snap.knowledge.map((k) => `### ${k.title}\n${k.body}`).join("\n\n");
      facts = [orders && `ORDERS\n${orders}`, kb && `KNOWLEDGE BASE\n${kb}`]
        .filter(Boolean)
        .join("\n\n");
    } catch (e) {
      console.error("could not load workspace facts", e);
    }

    const instructions = `You are Nexa, an AI customer-support agent${data.business ? ` for ${data.business}` : ""}. Write one ready-to-send reply to the customer in a ${data.tone.toLowerCase()} tone, under 120 words. Acknowledge the issue and give a concrete next step.
STRICT RULES: Only state specifics (order numbers, statuses, dates, prices, policies) that appear in the WORKSPACE FACTS below. Never invent order numbers, timelines, amounts or policies. If a needed fact is missing, say you will check and ask the customer for the detail you need (e.g. their order number). Output only the reply text.

WORKSPACE FACTS:
${facts || "(No workspace data has been added yet.)"}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions,
        input: `Customer scenario:\n${data.scenario}`,
        stream: true,
        store: false,
        reasoning: { effort: "low" },
      }),
    });

    if (!res.ok || !res.body) {
      const msg =
        res.status === 429
          ? "Too many requests right now — please try again in a moment."
          : res.status === 402
            ? "AI credits are used up for this workspace."
            : `The AI couldn't respond (error ${res.status}).`;
      return { ok: false as const, error: msg };
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "",
      text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") text += ev.delta;
        } catch {
          /* ignore */
        }
      }
    }
    text = text.trim();
    if (!text)
      return {
        ok: false as const,
        error: "The AI returned an empty reply. Try rephrasing the scenario.",
      };
    return { ok: true as const, reply: text, sample: false as const };
  });
