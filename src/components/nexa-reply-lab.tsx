import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Check, Sparkles, Loader2 } from "lucide-react";
import { generateReply } from "@/lib/reply.functions";

const tones = ["Friendly", "Professional", "Empathetic", "Concise"] as const;
const examples = [
  "My package says delivered but it's not at my door. I need it for a birthday tomorrow.",
  "I was charged twice for my subscription this month.",
  "The jacket I got is too small — can I swap it for a large?",
];

export function ReplyLab() {
  const run = useServerFn(generateReply);
  const [scenario, setScenario] = useState("");
  const [business, setBusiness] = useState("");
  const [tone, setTone] = useState<(typeof tones)[number]>("Friendly");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [isSampleReply, setIsSampleReply] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (scenario.trim().length < 5 || loading) return;
    setLoading(true);
    setError("");
    setReply("");
    setIsSampleReply(false);
    try {
      const r = await run({ data: { scenario, tone, business } });
      if (r.ok) {
        setReply(r.reply);
        setIsSampleReply(r.sample);
      } else setError(r.error);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="reply-lab" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="eyebrow text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          AI REPLY LAB
        </div>
        <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <h2 className="section-title max-w-2xl">
            Describe a problem.
            <br />
            Get the perfect reply.
          </h2>
          <p className="max-w-sm text-muted-foreground">
            Type any customer situation and Nexa's AI drafts a tailored, ready-to-send response in
            seconds.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <form onSubmit={submit} className="kb-panel flex flex-col gap-5">
            <label className="text-xs font-semibold">
              Customer scenario
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                maxLength={1500}
                rows={5}
                placeholder="e.g. My order hasn't arrived and it's been a week…"
                className="mt-2 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm font-normal outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {examples.map((x) => (
                <button
                  type="button"
                  key={x}
                  aria-label={`Use example: ${x}`}
                  onClick={() => setScenario(x)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  {x.slice(0, 34)}…
                </button>
              ))}
            </div>
            <label className="text-xs font-semibold">
              Your business (optional)
              <input
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                maxLength={120}
                placeholder="e.g. Loom & Thread apparel"
                className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm font-normal outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <div>
              <span id="tone-label" className="text-xs font-semibold">
                Tone
              </span>
              <div
                role="group"
                aria-labelledby="tone-label"
                className="mt-2 flex flex-wrap gap-1 rounded-full border border-border p-1 w-fit"
              >
                {tones.map((t) => (
                  <button
                    type="button"
                    key={t}
                    aria-pressed={tone === t}
                    onClick={() => setTone(t)}
                    className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background relative rounded-full px-3 py-1.5 text-[11px] font-semibold ${tone === t ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {tone === t && (
                      <motion.span
                        layoutId="tone-pill"
                        className="absolute inset-0 rounded-full bg-primary"
                      />
                    )}
                    <span className="relative">{t}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || scenario.trim().length < 5}
              className="mt-auto flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-accent disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {loading ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <Sparkles aria-hidden className="size-4" />
              )}
              {loading ? "Writing reply…" : "Generate reply"}
            </button>
          </form>

          <div className="product-window flex flex-col">
            <div className="window-bar">
              <div className="flex gap-1.5">
                <i />
                <i />
                <i />
              </div>
              <div className="flex items-center gap-2 text-[9px] font-semibold">
                <span className="grid size-4 place-items-center rounded bg-primary text-primary-foreground">
                  N
                </span>
                Nexa AI draft
              </div>
              <span className="text-[8px] text-muted-foreground">
                {isSampleReply ? "Sample reply" : tone}
              </span>
            </div>
            <div
              aria-live="polite"
              aria-busy={loading}
              className="flex min-h-[360px] flex-1 flex-col gap-4 bg-canvas p-6"
            >
              {scenario.trim() && (
                <div className="max-w-[85%] rounded-[14px_14px_14px_3px] bg-surface p-3 text-sm shadow-ui">
                  {scenario}
                </div>
              )}
              <AnimatePresence mode="sync">
                {loading && (
                  <motion.div
                    key="l"
                    role="status"
                    aria-label="Writing reply"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-auto flex gap-1 rounded-full bg-ai-message px-4 py-3"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="size-1.5 rounded-full bg-ai-message-foreground"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      />
                    ))}
                  </motion.div>
                )}
                {reply && !loading && (
                  <motion.div
                    key="r"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ml-auto max-w-[90%]"
                  >
                    <div className="whitespace-pre-wrap rounded-[14px_14px_3px_14px] bg-ai-message p-4 text-sm leading-relaxed text-ai-message-foreground">
                      {reply}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(reply);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      className="ml-auto mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                      {copied ? "Copied" : "Copy reply"}
                    </button>
                  </motion.div>
                )}
                {error && !loading && (
                  <motion.p
                    key="e"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    role="alert"
                    className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              {!scenario.trim() && !reply && !error && !loading && (
                <p className="m-auto text-center text-sm text-muted-foreground">
                  Your AI-drafted reply will appear here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
