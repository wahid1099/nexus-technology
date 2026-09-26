import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight, Bot, Check, Clock, Inbox, MessageCircle, Search, Send,
  Sparkles, TrendingUp, Workflow as WorkflowIcon, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getWorkspaceSnapshot, type WorkspaceSnapshot } from "@/lib/workspace.functions";

const ease = [0.22, 1, 0.36, 1] as const;

type Thread = {
  name: string;
  channel: string;
  time: string;
  tint: string;
  preview: string;
  messages: { from: "customer" | "ai"; text: string }[];
  intent: string;
  confidence: number;
  status: string;
  meta: [string, string][];
};

const threads: Thread[] = [
  {
    name: "Sarah Williams", channel: "Website", time: "Now", tint: "bg-avatar-lilac text-primary",
    preview: "Can you tell me where my order is?",
    messages: [
      { from: "customer", text: "Can you tell me where my order is?" },
      { from: "ai", text: "Absolutely. Order #NX-20491 shipped this morning and arrives tomorrow." },
    ],
    intent: "Order tracking", confidence: 98, status: "AI resolved",
    meta: [["Customer since", "2025"], ["Orders", "12"], ["Total spent", "$1,280"], ["Sentiment", "Positive"]],
  },
  {
    name: "John Carter", channel: "WhatsApp", time: "2m", tint: "bg-avatar-green text-success",
    preview: "I'd like to exchange the size",
    messages: [
      { from: "customer", text: "I'd like to exchange the size on my last order." },
      { from: "ai", text: "No problem — I've created exchange label EX-7741 for a medium. It's in your inbox." },
    ],
    intent: "Returns & exchange", confidence: 94, status: "AI resolved",
    meta: [["Customer since", "2024"], ["Orders", "7"], ["Total spent", "$640"], ["Sentiment", "Neutral"]],
  },
  {
    name: "Michael Chen", channel: "Instagram", time: "8m", tint: "bg-avatar-peach text-avatar-peach-foreground",
    preview: "Does this ship internationally?",
    messages: [
      { from: "customer", text: "Does this ship internationally?" },
      { from: "ai", text: "Yes — we ship to 42 countries. Delivery to Singapore takes 4–6 days." },
    ],
    intent: "Shipping policy", confidence: 91, status: "AI resolved",
    meta: [["Customer since", "2026"], ["Orders", "1"], ["Total spent", "$95"], ["Sentiment", "Positive"]],
  },
  {
    name: "David Kim", channel: "Messenger", time: "18m", tint: "bg-secondary text-muted-foreground",
    preview: "I can't access my account",
    messages: [
      { from: "customer", text: "I can't access my account, the reset link expired." },
      { from: "ai", text: "I've sent a fresh secure link and flagged this for a specialist to follow up." },
    ],
    intent: "Account access", confidence: 72, status: "Handed to agent",
    meta: [["Customer since", "2023"], ["Orders", "21"], ["Total spent", "$3,410"], ["Sentiment", "Frustrated"]],
  },
];

const steps = [
  { id: "message", label: "Customer message", icon: MessageCircle, detail: "Every channel lands in one stream — web chat, WhatsApp, Instagram, Messenger.", stat: "10,482 / week" },
  { id: "intent", label: "Intent detection", icon: Sparkles, detail: "Nexa classifies the request and pulls the matching customer record instantly.", stat: "96% accuracy" },
  { id: "branch", label: "Order question?", icon: WorkflowIcon, detail: "A branch decides whether to query live order data or search your knowledge base.", stat: "2 paths" },
  { id: "action", label: "Search order", icon: Zap, detail: "Live lookup in your store returns status, carrier and delivery window.", stat: "0.8s lookup" },
  { id: "reply", label: "Generate response", icon: Bot, detail: "A grounded reply is written in your brand tone and sent for review or auto-send.", stat: "12 sec avg" },
  { id: "resolve", label: "Resolve or escalate", icon: Check, detail: "Confident answers close the thread. Anything unclear routes to a human with full context.", stat: "82% resolved" },
];

const ranges = {
  "7 days": { bars: [62, 74, 58, 81, 69, 88, 92], resolution: 82, response: "12 sec", csat: 94, volume: "2,140" },
  "30 days": { bars: [48, 55, 61, 58, 72, 76, 84], resolution: 78, response: "15 sec", csat: 92, volume: "9,860" },
  "90 days": { bars: [34, 41, 47, 52, 58, 66, 71], resolution: 71, response: "19 sec", csat: 89, volume: "28,405" },
} as const;

type RangeKey = keyof typeof ranges;
type RangeData = { bars: readonly number[]; resolution: number; response: string; csat: number; volume: string };
const tints = ["bg-avatar-lilac text-primary", "bg-avatar-green text-success", "bg-avatar-peach text-avatar-peach-foreground", "bg-secondary text-muted-foreground"];

function ago(iso: string) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "Now";
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.round(m / 60)}h`;
  return `${Math.round(m / 1440)}d`;
}

function toThreads(snap: WorkspaceSnapshot): Thread[] {
  return snap.threads.map((t, i) => ({
    name: t.name, channel: t.channel, time: ago(t.created_at), tint: tints[i % tints.length]!,
    preview: t.messages.find((m) => m.from === "customer")?.text ?? t.intent,
    messages: t.messages, intent: t.intent, confidence: t.confidence, status: t.status, meta: t.meta,
  }));
}

function toRanges(snap: WorkspaceSnapshot): Record<RangeKey, RangeData> {
  const bars = snap.analytics.daily.map((d) => d.value);
  const r = (k: RangeKey): RangeData => {
    const a = snap.analytics[k];
    return { bars, resolution: a.resolution, response: `${a.response} sec`, csat: a.csat, volume: a.count.toLocaleString() };
  };
  return { "7 days": r("7 days"), "30 days": r("30 days"), "90 days": r("90 days") };
}

const tabs = [
  { id: "inbox", label: "Unified inbox", icon: Inbox },
  { id: "workflow", label: "Automation workflow", icon: WorkflowIcon },
  { id: "analytics", label: "Response analytics", icon: TrendingUp },
] as const;

function focusItem(items: Array<HTMLButtonElement | null>, index: number) {
  items[index]?.focus();
}

function getKeyboardIndex(event: KeyboardEvent, current: number, length: number, vertical = false) {
  const previousKey = vertical ? "ArrowUp" : "ArrowLeft";
  const nextKey = vertical ? "ArrowDown" : "ArrowRight";
  if (event.key === previousKey) return (current - 1 + length) % length;
  if (event.key === nextKey) return (current + 1) % length;
  if (event.key === "Home") return 0;
  if (event.key === "End") return length - 1;
  return null;
}

export function InteractiveDemo() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("inbox");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = useReducedMotion();
  const fetchSnapshot = useServerFn(getWorkspaceSnapshot);
  const { data: snapRes } = useQuery({ queryKey: ["workspace-snapshot"], queryFn: () => fetchSnapshot(), staleTime: 60_000 });
  const snap = snapRes?.ok ? snapRes.snapshot : null;
  const live = !!snap && snap.threads.length > 0;
  const liveThreads = live ? toThreads(snap) : threads;
  const liveRanges = live ? toRanges(snap) : ranges;

  const selectTabFromKeyboard = (event: KeyboardEvent, index: number) => {
    const nextIndex = getKeyboardIndex(event, index, tabs.length);
    if (nextIndex === null) return;
    event.preventDefault();
    setTab(tabs[nextIndex]!.id);
    focusItem(tabRefs.current, nextIndex);
  };

  return (
    <section id="demo" className="relative overflow-hidden py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: reducedMotion ? 0 : .8, ease }}>
          <div className="eyebrow text-muted-foreground"><span className="size-1.5 rounded-full bg-primary" />TRY IT YOURSELF</div>
          <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <h2 className="section-title max-w-2xl">Explore Nexa.<br />Right here.</h2>
            <p className="max-w-sm text-muted-foreground"><span className={`mb-2 inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold ${live ? "text-success" : "text-muted-foreground"}`}><span aria-hidden className={`size-1.5 rounded-full ${live ? "bg-success" : "bg-muted-foreground"}`} />{live ? "Live workspace data · names anonymised" : "Sample data"}</span><br />Open a conversation, follow the automation path, and watch the numbers move — no signup, no sales call.</p>
          </div>
        </motion.div>

        <div className="mt-12 flex flex-wrap gap-2" role="tablist" aria-label="Explore Nexa product features">
          {tabs.map((t, index) => (
            <Button
              key={t.id}
              ref={(node) => { tabRefs.current[index] = node; }}
              role="tab"
              id={`demo-tab-${t.id}`}
              aria-controls={`demo-panel-${t.id}`}
              aria-selected={tab === t.id}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(event) => selectTabFromKeyboard(event, index)}
              variant="outline"
              size="sm"
              className={`relative h-10 gap-2 overflow-hidden border px-4 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${tab === t.id ? "border-transparent text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab === t.id && <motion.span aria-hidden {...(reducedMotion ? {} : { layoutId: "demo-tab" })} className="absolute inset-0 rounded-full bg-primary shadow-accent" transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }} />}
              <t.icon aria-hidden className="relative size-3.5" />
              <span className="relative">{t.label}</span>
            </Button>
          ))}
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait" initial={!reducedMotion}>
            <motion.div key={tab} id={`demo-panel-${tab}`} role="tabpanel" aria-labelledby={`demo-tab-${tab}`} tabIndex={0} className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background" initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -10 }} transition={{ duration: reducedMotion ? 0 : .45, ease }}>
              {tab === "inbox" && <InboxDemo threads={liveThreads} />}
              {tab === "workflow" && <WorkflowDemo />}
              {tab === "analytics" && <AnalyticsDemo ranges={liveRanges} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function InboxDemo({ threads }: { threads: Thread[] }) {
  const [active, setActive] = useState(0);
  const thread = (threads[active] ?? threads[0])!;
  const threadRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = useReducedMotion();

  const selectThreadFromKeyboard = (event: KeyboardEvent, index: number) => {
    const nextIndex = getKeyboardIndex(event, index, threads.length, true);
    if (nextIndex === null) return;
    event.preventDefault();
    setActive(nextIndex);
    focusItem(threadRefs.current, nextIndex);
  };

  return (
    <div className="product-window">
      <div className="window-bar">
        <div className="flex items-center gap-3"><div className="flex gap-1.5"><i /><i /><i /></div><span className="hidden text-[8px] font-medium uppercase text-muted-foreground sm:block">Live demo / Inbox</span></div>
        <div className="flex items-center gap-2 text-[9px] font-semibold"><span className="grid size-4 place-items-center rounded bg-primary text-primary-foreground">N</span>Nexa Inbox</div>
        <span className="flex items-center gap-1.5 text-[8px] text-success"><span className="size-1.5 rounded-full bg-success" />Interactive</span>
      </div>
      <div className="grid min-h-[460px] grid-cols-[230px_minmax(300px,1fr)_215px]">
        <div className="border-r border-border bg-surface">
          <div className="flex h-14 items-center justify-between border-b border-border px-4"><strong className="text-xs">Conversations</strong><Search aria-hidden className="size-3.5 text-muted-foreground" /></div>
          <div className="p-2" role="tablist" aria-label="Customer conversations" aria-orientation="vertical">
            {threads.map((t, i) => (
              <Button key={t.name} ref={(node) => { threadRefs.current[i] = node; }} role="tab" id={`conversation-tab-${i}`} aria-controls="active-conversation" aria-selected={i === active} tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)} onKeyDown={(event) => selectThreadFromKeyboard(event, i)} variant="ghost" className={`h-auto min-h-11 w-full justify-start gap-3 rounded-md p-2.5 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${i === active ? "bg-secondary" : "hover:bg-secondary/60"}`}>
                <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${t.tint}`}>{t.name.split(" ").map((x) => x[0]).join("")}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2"><span className="truncate text-[11px] font-semibold">{t.name}</span><span className="text-[9px] text-muted-foreground">{t.time}</span></span>
                  <span className="mt-1 block truncate text-[9px] text-muted-foreground">{t.preview}</span>
                  <span className="mt-1.5 inline-block rounded-full border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">{t.channel}</span>
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div id="active-conversation" role="tabpanel" aria-labelledby={`conversation-tab-${active}`} aria-live="polite" className="flex min-w-0 flex-col bg-canvas">
          <div className="flex h-14 items-center justify-between border-b border-border bg-surface px-5">
            <div className="flex items-center gap-2">
              <span className={`grid size-8 place-items-center rounded-full text-[10px] font-semibold ${thread.tint}`}>{thread.name.split(" ").map((x) => x[0]).join("")}</span>
              <div><div className="text-[11px] font-semibold">{thread.name}</div><div className="text-[9px] text-muted-foreground">{thread.channel}</div></div>
            </div>
            <span className="status-pill">{thread.status}</span>
          </div>
          <div className="flex flex-1 flex-col justify-end gap-4 p-5">
            {thread.messages.map((m, i) => (
              <motion.div key={`${active}-${i}`} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : i * .25, duration: reducedMotion ? 0 : .5, ease }}
                className={m.from === "ai"
                  ? "ml-auto max-w-[82%] rounded-[14px_14px_3px_14px] bg-ai-message p-3 text-[10px] leading-relaxed text-ai-message-foreground"
                  : "max-w-[78%] rounded-[14px_14px_14px_3px] bg-surface p-3 text-[10px] leading-relaxed shadow-ui"}>
                {m.text}
              </motion.div>
            ))}
            <motion.div key={`meta-${active}`} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reducedMotion ? 0 : .6 }} className="ml-auto flex w-[82%] items-center gap-2 rounded-lg border border-border bg-surface p-3 text-[9px] shadow-ui">
              <Sparkles aria-hidden className="size-3.5 text-primary" />
              <span className="font-semibold">{thread.intent}</span>
              <span className="text-muted-foreground">detected</span>
              <span className="ml-auto text-primary">{thread.confidence}% confidence</span>
            </motion.div>
          </div>
          <div className="m-4 flex items-center justify-between rounded-full border border-border bg-surface px-4 py-2 text-[9px] text-muted-foreground"><span>Write a reply…</span><Send aria-hidden className="size-3.5 text-primary" /></div>
        </div>

        <div className="border-l border-border bg-surface p-4">
          <div className="flex h-14 items-center border-b border-border"><strong className="text-xs">Customer details</strong></div>
          <div className="flex flex-col items-center py-5">
            <span className={`grid size-10 place-items-center rounded-full text-xs font-semibold ${thread.tint}`}>{thread.name.split(" ").map((x) => x[0]).join("")}</span>
            <strong className="mt-2 text-xs">{thread.name}</strong>
            <span className="mt-1 text-[9px] text-muted-foreground">{thread.channel} customer</span>
          </div>
          <div className="space-y-3 border-t border-border py-4 text-[9px]">
            {thread.meta.map(([a, b]) => <div className="flex justify-between" key={a}><span className="text-muted-foreground">{a}</span><strong>{b}</strong></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowDemo() {
  const [active, setActive] = useState(0);
  const step = (steps[active] ?? steps[0])!;
  const stepRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = useReducedMotion();

  const selectStepFromKeyboard = (event: KeyboardEvent, index: number) => {
    const nextIndex = getKeyboardIndex(event, index, steps.length);
    if (nextIndex === null) return;
    event.preventDefault();
    setActive(nextIndex);
    focusItem(stepRefs.current, nextIndex);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="workflow-canvas !h-auto overflow-x-auto p-6">
        <div className="flex min-w-[760px] items-center gap-3" role="tablist" aria-label="Automation workflow steps">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <Button ref={(node) => { stepRefs.current[i] = node; }} role="tab" id={`workflow-tab-${s.id}`} aria-controls="workflow-step-panel" aria-selected={i === active} tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)} onKeyDown={(event) => selectStepFromKeyboard(event, i)} variant="outline" className={`h-auto min-h-[108px] w-[132px] flex-col items-start gap-2 rounded-xl p-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${i === active ? "border-primary shadow-accent" : "shadow-ui hover:-translate-y-1"}`}>
                <span className={`grid size-7 place-items-center rounded-lg ${i === active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}><s.icon className="size-3.5" /></span>
                <span className="text-[11px] font-semibold leading-tight">{s.label}</span>
                <span className="text-[9px] text-muted-foreground">{s.stat}</span>
              </Button>
              {i < steps.length - 1 && (
                <span className="relative block h-px w-8 bg-border">
                   <motion.span className="absolute inset-y-0 left-0 block bg-primary" animate={{ width: i < active ? "100%" : "0%" }} transition={{ duration: reducedMotion ? 0 : .4, ease }} />
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex min-w-[760px] items-center gap-2 text-[10px] text-muted-foreground">
          <span className="rounded-full border border-border bg-surface px-2.5 py-1">YES → live order lookup</span>
          <span className="rounded-full border border-border bg-surface px-2.5 py-1">NO → AI knowledge search</span>
          <span className="ml-auto flex items-center gap-1.5"><Clock className="size-3" />Average path time 12 sec</span>
        </div>
      </div>

      <div id="workflow-step-panel" role="tabpanel" aria-labelledby={`workflow-tab-${step.id}`} aria-live="polite" className="kb-panel flex flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Step {active + 1} of {steps.length}</span>
        <AnimatePresence mode="wait" initial={!reducedMotion}>
          <motion.div key={step.id} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }} transition={{ duration: reducedMotion ? 0 : .35, ease }}>
            <h3 className="mt-3 text-2xl font-medium">{step.label}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-[11px] font-semibold text-primary"><Zap className="size-3" />{step.stat}</div>
          </motion.div>
        </AnimatePresence>
        <div className="mt-auto flex gap-2 pt-8">
          <Button variant="outline" size="sm" aria-label="Go to previous workflow step" onClick={() => setActive((a) => Math.max(0, a - 1))} disabled={active === 0}>Back</Button>
          <Button size="sm" aria-label="Go to next workflow step" onClick={() => setActive((a) => Math.min(steps.length - 1, a + 1))} disabled={active === steps.length - 1}>Next step <ArrowRight aria-hidden className="size-3" /></Button>
        </div>
      </div>
    </div>
  );
}

function AnalyticsDemo({ ranges }: { ranges: Record<RangeKey, RangeData> }) {
  const [range, setRange] = useState<RangeKey>("7 days");
  const data = ranges[range];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];  // sample labels
  const rangeKeys = Object.keys(ranges) as RangeKey[];
  const rangeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = useReducedMotion();

  const selectRangeFromKeyboard = (event: KeyboardEvent, index: number) => {
    const nextIndex = getKeyboardIndex(event, index, rangeKeys.length);
    if (nextIndex === null) return;
    event.preventDefault();
    setRange(rangeKeys[nextIndex]!);
    focusItem(rangeRefs.current, nextIndex);
  };

  return (
    <div className="kb-panel">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <strong className="text-sm">Response performance</strong>
          <p className="mt-1 text-xs text-muted-foreground">{data.volume} conversations in the last {range}</p>
        </div>
        <div className="flex gap-1 rounded-full border border-border p-1" role="radiogroup" aria-label="Analytics date range">
          {rangeKeys.map((r, index) => (
            <Button ref={(node) => { rangeRefs.current[index] = node; }} key={r} role="radio" aria-checked={range === r} tabIndex={range === r ? 0 : -1} onClick={() => setRange(r)} onKeyDown={(event) => selectRangeFromKeyboard(event, index)} variant="ghost" size="sm" className={`relative h-8 px-3 text-[11px] font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${range === r ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {range === r && <motion.span aria-hidden {...(reducedMotion ? {} : { layoutId: "range-pill" })} className="absolute inset-0 rounded-full bg-primary" transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 30 }} />}
              <span className="relative">{r}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px]">
        <div>
           <div className="flex h-56 items-end gap-3" role="img" aria-label={`AI resolution by day for the last ${range}: ${data.bars.map((value, index) => `${days[index]} ${value}%`).join(", ")}`}>
            {data.bars.map((v, i) => (
              <div key={i} className="group flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">{v}%</span>
                <motion.div aria-hidden className="w-full rounded-t-md bg-primary/85" initial={reducedMotion ? { height: `${v}%` } : { height: 0 }} animate={{ height: `${v}%` }} transition={{ duration: reducedMotion ? 0 : .7, delay: reducedMotion ? 0 : i * .05, ease }} />
                <span className="text-[10px] text-muted-foreground">{days[i]}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Share of conversations resolved by AI without human help.</p>
        </div>

        <div className="grid gap-3">
          {[["AI resolution", `${data.resolution}%`], ["Average response", data.response], ["Customer satisfaction", `${data.csat}%`]].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border p-4">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
              <motion.strong key={`${label}-${range}`} initial={reducedMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : .4, ease }} className="mt-2 block text-3xl font-medium">{value}</motion.strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
