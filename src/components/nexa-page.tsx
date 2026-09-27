import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  CircleUserRound,
  FileText,
  Globe2,
  Instagram,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { InteractiveDemo } from "@/components/nexa-demo";
import { ReplyLab } from "@/components/nexa-reply-lab";
import commerceImage from "@/assets/nexa-commerce.jpg";
import healthcareImage from "@/assets/nexa-healthcare.jpg";
import educationImage from "@/assets/nexa-education.jpg";
import saasImage from "@/assets/nexa-saas.jpg";
import sarahImage from "@/assets/nexa-sarah.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={`eyebrow ${dark ? "text-dark-muted" : "text-muted-foreground"}`}>
      <span className="size-1.5 rounded-full bg-primary" />
      {children}
    </div>
  );
}

function Orbit({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full border border-orbit ${className}`}
    >
      <div className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/60" />
    </div>
  );
}

function Avatar({ name, tint = "" }: { name: string; tint?: string }) {
  return (
    <div
      className={`grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${tint || "bg-secondary text-secondary-foreground"}`}
    >
      {name
        .split(" ")
        .map((x) => x[0])
        .join("")}
    </div>
  );
}

const people = [
  {
    name: "Sarah Williams",
    text: "Can you tell me where my order is?",
    time: "Now",
    active: true,
    tint: "bg-avatar-lilac text-primary",
  },
  {
    name: "John Carter",
    text: "I'd like to exchange the size",
    time: "2m",
    tint: "bg-avatar-green text-success",
  },
  {
    name: "Michael Chen",
    text: "Does this ship internationally?",
    time: "8m",
    tint: "bg-avatar-peach text-avatar-peach-foreground",
  },
  {
    name: "Emily Stone",
    text: "Thank you for your help!",
    time: "12m",
    tint: "bg-avatar-blue text-avatar-blue-foreground",
  },
  {
    name: "David Kim",
    text: "I can't access my account",
    time: "18m",
    tint: "bg-secondary text-muted-foreground",
  },
];

function ConversationList({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <strong className="text-sm">Conversations</strong>
        <Search className="size-4 text-muted-foreground" />
      </div>
      <div className="p-2">
        {people.slice(0, compact ? 4 : 5).map((p) => (
          <div
            key={p.name}
            className={`flex gap-3 rounded-md p-2.5 ${p.active ? "bg-secondary" : ""}`}
          >
            <Avatar name={p.name} tint={p.tint} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-semibold">{p.name}</span>
                <span className="text-[9px] text-muted-foreground">{p.time}</span>
              </div>
              <p className="mt-1 truncate text-[9px] text-muted-foreground">{p.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatBody({ order = false, animated = false }: { order?: boolean; animated?: boolean }) {
  return (
    <div className="flex h-full min-w-0 flex-col bg-canvas">
      <div className="flex h-14 items-center justify-between border-b border-border bg-surface px-5">
        <div className="flex items-center gap-2">
          <Avatar name="Sarah Williams" tint="bg-avatar-lilac text-primary" />
          <div>
            <div className="text-[11px] font-semibold">Sarah Williams</div>
            <div className="text-[9px] text-success">Online</div>
          </div>
        </div>
        <MoreHorizontal className="size-4 text-muted-foreground" />
      </div>
      <div className="flex flex-1 flex-col justify-end gap-4 overflow-hidden p-5">
        <div className="flex max-w-[78%] items-end gap-2">
          <Avatar name="Sarah Williams" tint="bg-avatar-lilac text-primary" />
          <div className="rounded-[14px_14px_14px_3px] bg-surface p-3 text-[10px] leading-relaxed shadow-ui">
            {order
              ? "Can you tell me where my order is?"
              : "Hi, I ordered yesterday but haven't received an update."}
          </div>
        </div>
        <motion.div
          className="ml-auto max-w-[82%] rounded-[14px_14px_3px_14px] bg-ai-message p-3 text-[10px] leading-relaxed text-ai-message-foreground"
          initial={animated ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.6 }}
        >
          {order
            ? "Absolutely. Let me check that for you."
            : "I found your order. It's currently being prepared and should ship today."}
        </motion.div>
        {order && (
          <div className="ml-auto w-[82%] rounded-lg border border-border bg-surface p-3 shadow-ui">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold">Order #NX-20491</span>
              <span className="status-pill">Shipped</span>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-[9px]">
              <div>
                <span className="text-muted-foreground">Status</span>
                <strong className="mt-1 block">In transit</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Expected</span>
                <strong className="mt-1 block">Tomorrow</strong>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="m-4 flex items-center justify-between rounded-full border border-border bg-surface px-4 py-2 text-[9px] text-muted-foreground">
        <span>Write a reply…</span>
        <Send className="size-3.5 text-primary" />
      </div>
    </div>
  );
}

function CustomerPanel() {
  return (
    <div className="h-full bg-surface p-4">
      <div className="flex h-14 items-center border-b border-border">
        <strong className="text-xs">Customer details</strong>
      </div>
      <div className="flex flex-col items-center py-5">
        <Avatar name="Sarah Williams" tint="bg-avatar-lilac text-primary" />
        <strong className="mt-2 text-xs">Sarah Williams</strong>
        <span className="mt-1 text-[9px] text-muted-foreground">sarah@example.com</span>
      </div>
      <div className="space-y-3 border-t border-border py-4 text-[9px]">
        {[
          ["Customer since", "2025"],
          ["Orders", "12"],
          ["Total spent", "$1,280"],
          ["Sentiment", "Positive"],
        ].map(([a, b]) => (
          <div className="flex justify-between" key={a}>
            <span className="text-muted-foreground">{a}</span>
            <strong className={a === "Sentiment" ? "text-success" : ""}>{b}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductWindow({
  detailed = false,
  className = "",
}: {
  detailed?: boolean;
  className?: string;
}) {
  return (
    <div className={`product-window ${className}`}>
      <div className="window-bar">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <i />
            <i />
            <i />
          </div>
          <span className="hidden text-[8px] font-medium uppercase text-muted-foreground sm:block">
            Workspace / Inbox
          </span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-semibold">
          <span className="grid size-4 place-items-center rounded bg-primary text-primary-foreground">
            N
          </span>
          Nexa Inbox
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-[8px] text-success sm:flex">
            <span className="size-1.5 rounded-full bg-success" />
            All systems live
          </span>
          <div className="size-5 rounded-full bg-secondary" />
        </div>
      </div>
      <div className="grid h-[360px] grid-cols-[52px_190px_minmax(280px,1fr)_185px] md:h-[460px]">
        <div className="flex flex-col items-center gap-5 border-r border-border bg-ink py-4 text-dark-muted">
          <div className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground text-[10px] font-bold">
            N
          </div>
          <MessageCircle className="size-4 text-dark-foreground" />
          <CircleUserRound className="size-4" />
          <Zap className="size-4" />
          <div className="mt-auto size-6 rounded-full bg-dark-surface" />
        </div>
        <ConversationList compact={!detailed} />
        <ChatBody order={detailed} animated={!detailed} />
        <CustomerPanel />
      </div>
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { scrollY } = useScroll();
  const navWidth = useTransform(scrollY, [0, 200], ["94%", "88%"]);
  useEffect(() => {
    const savedTheme = window.localStorage.getItem("nexa-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDarkMode = savedTheme === "dark" || (savedTheme !== "light" && prefersDark);
    setDarkMode(shouldUseDarkMode);
    document.documentElement.classList.toggle("dark", shouldUseDarkMode);
  }, []);
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((isOpen) => !isOpen);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);
  const toggleTheme = () => {
    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);
    document.documentElement.classList.toggle("dark", nextDarkMode);
    window.localStorage.setItem("nexa-theme", nextDarkMode ? "dark" : "light");
  };
  const navigateTo = (target: string) => {
    setPaletteOpen(false);
    setOpen(false);
    document.getElementById(target)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };
  const themeLabel = darkMode ? "Switch to light mode" : "Switch to dark mode";
  const ThemeIcon = darkMode ? Sun : Moon;
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease }}
      style={{ width: navWidth, backgroundColor: "var(--nav-background)" }}
      className="fixed left-1/2 top-4 z-50 flex h-16 max-w-[1240px] -translate-x-1/2 items-center justify-between rounded-xl border border-nav-border px-4 shadow-nav backdrop-blur-2xl md:px-6"
    >
      <a href="#top" className="flex items-center gap-2.5 text-xl font-semibold">
        <span className="grid size-7 place-items-center rounded-lg bg-ink text-[12px] font-bold text-dark-foreground">
          N
        </span>
        Nexa<span className="text-primary">.</span>
      </a>
      <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        {["Product", "Solutions", "Resources", "Pricing"].map((x) => (
          <a
            className="transition-colors hover:text-foreground"
            href={`#${x.toLowerCase()}`}
            key={x}
          >
            {x}
          </a>
        ))}
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPaletteOpen(true)}
          aria-label="Open command menu"
          aria-keyshortcuts="Control+k Meta+k"
          title="Search sections and actions (Ctrl+K)"
        >
          <Search className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={themeLabel}
          title={themeLabel}
        >
          <ThemeIcon className="size-4" />
        </Button>
        <Button variant="ghost" size="sm">
          Sign in
        </Button>
        <Button size="sm">
          Start free <ArrowRight className="size-3.5" />
        </Button>
      </div>
      <button
        aria-label="Toggle menu"
        className="grid size-10 place-items-center md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 right-0 top-[72px] rounded-2xl border border-border bg-surface p-5 shadow-window md:hidden"
          >
            <div className="flex flex-col gap-4">
              {["Product", "Solutions", "Resources", "Pricing"].map((x) => (
                <a href={`#${x.toLowerCase()}`} onClick={() => setOpen(false)} key={x}>
                  {x}
                </a>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setPaletteOpen(true);
                }}
              >
                <Search className="size-4" />
                Search sections
              </Button>
              <Button variant="outline" onClick={toggleTheme}>
                <ThemeIcon className="size-4" />
                {themeLabel}
              </Button>
              <Button>Start free</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <DialogTitle className="sr-only">Quick navigation</DialogTitle>
        <DialogDescription className="sr-only">
          Search for a page section or action.
        </DialogDescription>
        <CommandInput placeholder="Search sections and actions..." />
        <CommandList>
          <CommandEmpty>No matching sections or actions.</CommandEmpty>
          <CommandGroup heading="Navigate">
            <CommandItem value="home top" onSelect={() => navigateTo("top")}>
              <Sparkles />
              Home
              <CommandShortcut>Enter</CommandShortcut>
            </CommandItem>
            <CommandItem value="product inbox" onSelect={() => navigateTo("product")}>
              <MessageCircle />
              Product overview
              <CommandShortcut>Enter</CommandShortcut>
            </CommandItem>
            <CommandItem value="interactive demo try" onSelect={() => navigateTo("demo")}>
              <Bot />
              Interactive demo
              <CommandShortcut>Enter</CommandShortcut>
            </CommandItem>
            <CommandItem value="ai reply lab generate" onSelect={() => navigateTo("reply-lab")}>
              <Sparkles />
              AI reply lab
              <CommandShortcut>Enter</CommandShortcut>
            </CommandItem>
            <CommandItem value="solutions industries" onSelect={() => navigateTo("solutions")}>
              <ShoppingBag />
              Solutions
              <CommandShortcut>Enter</CommandShortcut>
            </CommandItem>
            <CommandItem value="get started pricing" onSelect={() => navigateTo("pricing")}>
              <ArrowRight />
              Get started
              <CommandShortcut>Enter</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Appearance">
            <CommandItem
              value="toggle theme appearance dark light"
              onSelect={() => {
                toggleTheme();
                setPaletteOpen(false);
              }}
            >
              <ThemeIcon />
              {themeLabel}
              <CommandShortcut>Enter</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </motion.header>
  );
}

function Hero() {
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [2, -2]), { stiffness: 80, damping: 20 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-2, 2]), { stiffness: 80, damping: 20 });
  return (
    <section id="top" className="hero-stage relative overflow-hidden px-5 pb-24 pt-32 md:pt-40">
      <Orbit className="-right-48 top-36 size-[620px] opacity-50" />
      <Orbit className="-left-56 top-[520px] size-[500px] opacity-30" />
      <div className="relative mx-auto max-w-[1180px] text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="hero-pill"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
            <span className="relative size-2 rounded-full bg-primary" />
          </span>
          AI CUSTOMER SUPPORT
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease }}
          className="hero-heading mx-auto mt-7 max-w-[1040px]"
        >
          Turn every conversation
          <br className="hidden sm:block" /> into <span className="text-primary">revenue.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8, ease }}
          className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          AI understands customer intent, takes the right action, and helps your team turn
          conversations into sales, resolutions, and long-term relationships.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button size="lg">
            Start Free Trial <ArrowRight className="size-4" />
          </Button>
          <Button variant="secondary" size="lg">
            See how it works
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.82, duration: 0.7 }}
          className="mx-auto mt-8 flex w-fit items-center gap-5 text-[10px] font-medium uppercase text-muted-foreground"
        >
          <span>Resolve</span>
          <i className="size-1 rounded-full bg-primary/40" />
          <span>Convert</span>
          <i className="size-1 rounded-full bg-primary/40" />
          <span>Retain</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 1.1, ease }}
          style={{ rotateX: rx, rotateY: ry, transformPerspective: 1400 }}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            x.set((e.clientX - r.left) / r.width - 0.5);
            y.set((e.clientY - r.top) / r.height - 0.5);
          }}
          onPointerLeave={() => {
            x.set(0);
            y.set(0);
          }}
          className="relative mx-auto mt-12 max-w-[1160px] text-left md:mt-14"
        >
          <ProductWindow />
          <FloatingMetric
            className="-left-4 top-[24%] md:-left-14"
            label="AI resolved"
            value="82%"
            delay={1.3}
          />
          <FloatingMetric
            className="-right-3 top-[35%] md:-right-12"
            label="Response time"
            value="12 sec"
            delay={1.5}
          />
          <FloatingMetric
            className="bottom-[-35px] left-[13%] hidden md:block"
            label="Customer sentiment"
            value="Positive"
            delay={1.7}
          />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingMetric({
  label,
  value,
  className,
  delay,
}: {
  label: string;
  value: string;
  className: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease }}
      className={`absolute z-10 rounded-xl border border-border bg-surface/90 p-3 shadow-float backdrop-blur-xl ${className}`}
    >
      <motion.div
        animate={{ y: [-3, 3, -3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
          <Sparkles className="size-3 text-primary" />
          {label}
        </div>
        <strong className="mt-1 block text-sm">{value}</strong>
      </motion.div>
    </motion.div>
  );
}

function StoryTransition() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], [80, -100]);
  const lines = [
    "Automate customer conversations with AI.",
    "Unify every channel.",
    "Resolve issues faster.",
    "Drive more revenue.",
  ];
  return (
    <section ref={ref} className="relative h-[260vh] bg-secondary">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <Orbit className="-right-20 size-[540px] opacity-70" />
        <motion.div
          style={{ y }}
          className="absolute right-[-7%] top-[26%] hidden w-[47%] rotate-3 lg:block"
        >
          <ProductWindow />
        </motion.div>
        <div className="relative z-10 mx-auto w-full max-w-[1240px] px-6">
          {lines.map((line, i) => (
            <motion.h2
              key={line}
              style={{
                opacity: useTransform(
                  scrollYProgress,
                  [i * 0.22, i * 0.22 + 0.1, i * 0.22 + 0.24],
                  [0.15, 1, 0.25],
                ),
              }}
              className="story-line"
            >
              {line}
            </motion.h2>
          ))}
        </div>
      </div>
    </section>
  );
}

function InboxSection() {
  return (
    <section id="product" className="relative overflow-hidden py-28 md:py-44">
      <div className="mx-auto grid max-w-[1400px] items-center gap-16 px-6 lg:grid-cols-[.72fr_1.3fr] lg:px-10">
        <Reveal>
          <Eyebrow>ONE WORKSPACE</Eyebrow>
          <h2 className="section-title mt-6">
            Every conversation.
            <br />
            One powerful inbox.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Bring website chat, WhatsApp, Instagram, Messenger, and every customer conversation
            together.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm font-medium">
            <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
              <Check className="size-4" />
            </span>
            Always in context. Always on time.
          </div>
        </Reveal>
        <Reveal delay={0.15} className="relative min-w-0 lg:translate-x-14">
          <Orbit className="-left-20 -top-20 size-96 opacity-50" />
          <ProductWindow detailed className="relative z-10 min-w-[850px] lg:min-w-0" />
        </Reveal>
      </div>
    </section>
  );
}

function AIAgent() {
  return (
    <section className="relative overflow-hidden bg-dark py-28 text-dark-foreground md:py-44">
      <div className="dark-glow" />
      <Orbit className="left-1/2 top-1/2 size-[780px] -translate-x-1/2 -translate-y-1/2 border-dark-border opacity-50" />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <Reveal>
          <Eyebrow dark>INTELLIGENT BY DESIGN</Eyebrow>
          <h2 className="section-title mx-auto mt-6 max-w-4xl">
            AI that understands what your customers actually need.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="ai-sequence mx-auto mt-16 max-w-2xl text-left">
            <div className="message dark-customer">Where is my order? I need it before Friday.</div>
            <div className="my-7 flex items-center justify-center gap-2 text-xs text-dark-muted">
              <span className="ai-pulse" />
              <span>Understanding intent and checking order data</span>
              <TypingDots />
            </div>
            <div className="message dark-ai ml-auto">
              Your order is already in transit and arrives Thursday—one day before you need it.
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="action-card mt-5 ml-auto"
            >
              <div className="grid size-9 place-items-center rounded-lg bg-primary/20 text-secondary-accent">
                <ShoppingBag className="size-4" />
              </div>
              <div>
                <strong className="block text-xs">Order status retrieved</strong>
                <span className="text-[10px] text-dark-muted">NX-20491 · Arrives Thursday</span>
              </div>
              <Check className="ml-auto size-4 text-success" />
            </motion.div>
            <div className="mt-6 flex justify-center">
              <span className="dark-status">
                <Check className="size-3" />
                Conversation resolved
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TypingDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.i
          key={i}
          className="size-1 rounded-full bg-secondary-accent"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.16 }}
        />
      ))}
    </span>
  );
}

function Knowledge() {
  const sources = [
    [Globe2, "Website", "Connected"],
    [ShoppingBag, "Product Catalog", "Synced"],
    [MessageCircle, "FAQs", "124 articles"],
    [FileText, "Support Docs", "Connected"],
    [FileText, "PDF Knowledge", "12 files"],
  ] as const;
  return (
    <section className="py-28 md:py-44">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>AI KNOWLEDGE</Eyebrow>
          <h2 className="section-title mt-6">
            Teach your AI
            <br />
            your business.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Connect your website, documents, FAQs, products, and internal knowledge.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="kb-panel">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground">Knowledge sources</span>
                <h3 className="mt-1 text-lg font-medium">Keep every answer accurate</h3>
              </div>
              <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </div>
            </div>
            <div className="space-y-2">
              {sources.map(([Icon, name, status], i) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={name}
                  className="source-row"
                >
                  <div className="grid size-9 place-items-center rounded-md bg-secondary">
                    <Icon className="size-4" />
                  </div>
                  <strong className="text-xs">{name}</strong>
                  <span className="ml-auto text-[10px] text-muted-foreground">{status}</span>
                  <Check className="size-3.5 text-success" />
                </motion.div>
              ))}
            </div>
            <div className="mt-5 rounded-lg bg-ink p-4 text-dark-foreground">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="ai-pulse" />
                  AI Knowledge
                </span>
                <span className="text-secondary-accent">Ready</span>
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-dark-surface">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "96%" }}
                  transition={{ duration: 1.4, ease }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const nodes = [
  ["Customer Message", MessageCircle, "left-[2%] top-[38%]"],
  ["Intent Detection", Sparkles, "left-[26%] top-[38%]"],
  ["Order Question?", Zap, "left-[50%] top-[38%]"],
  ["Search Order", Search, "left-[73%] top-[16%]"],
  ["AI Knowledge", Bot, "left-[73%] top-[62%]"],
  ["Generate Response", MessageCircle, "left-[96%] top-[38%]"],
] as const;
function Workflow() {
  return (
    <section className="overflow-hidden bg-secondary py-28 md:py-44">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow>NO-CODE AUTOMATION</Eyebrow>
          <h2 className="section-title mt-6">Build customer experiences without code.</h2>
        </Reveal>
        <div className="mt-16 overflow-x-auto pb-6">
          <div className="workflow-canvas relative min-w-[1100px]">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 420" fill="none">
              <motion.path
                d="M150 210H305M425 210H565M680 210C735 210 730 105 790 105M680 210C735 210 730 315 790 315M900 105C970 105 960 210 1045 210M900 315C970 315 960 210 1045 210"
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeDasharray="6 7"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 2, ease }}
              />
            </svg>
            {nodes.map(([name, Icon, pos], i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.13, type: "spring" }}
                key={name}
                className={`workflow-node ${pos}`}
              >
                <div className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <span>{name}</span>
                {name === "Order Question?" && (
                  <>
                    <i className="absolute -right-7 -top-3 text-[9px] not-italic text-success">
                      YES
                    </i>
                    <i className="absolute -right-6 bottom-0 text-[9px] not-italic text-muted-foreground">
                      NO
                    </i>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Integrations() {
  const names = ["WhatsApp", "Instagram", "Messenger", "Telegram", "HubSpot", "Shopify", "Web"];
  return (
    <section id="solutions" className="overflow-hidden py-24 md:py-36">
      <Reveal className="mx-auto max-w-2xl px-6 text-center">
        <Eyebrow>CONNECTED EVERYWHERE</Eyebrow>
        <h2 className="section-title mt-6">Meet customers where they are.</h2>
      </Reveal>
      <div className="marquee-wrap mt-14 space-y-4">
        {[names, [...names].reverse()].map((row, r) => (
          <motion.div
            key={r}
            className="flex w-max gap-4"
            animate={{ x: r === 0 ? [0, -900] : [-900, 0] }}
            transition={{ duration: r === 0 ? 28 : 32, repeat: Infinity, ease: "linear" }}
          >
            {[...row, ...row, ...row].map((n, i) => (
              <div className="integration-chip" key={`${n}-${i}`}>
                {n === "Instagram" ? (
                  <Instagram />
                ) : n === "Shopify" ? (
                  <ShoppingBag />
                ) : n === "Web" ? (
                  <Globe2 />
                ) : (
                  <MessageCircle />
                )}
                <span>{n}</span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function getMessengerReply(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("order") || normalized.includes("track")) {
    return "I can help with that. Your latest order is on its way. Share your order number and I’ll check the latest delivery update.";
  }
  if (normalized.includes("return") || normalized.includes("exchange")) {
    return "Of course. Returns are free within 30 days. I can help find your order and start an exchange.";
  }
  if (
    normalized.includes("browse") ||
    normalized.includes("product") ||
    normalized.includes("shop")
  ) {
    return "Happy to help you find something. What are you looking for today?";
  }
  if (
    normalized.includes("support") ||
    normalized.includes("person") ||
    normalized.includes("human")
  ) {
    return "Absolutely. I can connect you with a support specialist. What would you like them to know?";
  }
  return "Thanks for reaching out. I’m here to help. Could you share a little more so I can point you in the right direction?";
}

function MessengerSection() {
  const [messages, setMessages] = useState<Array<{ from: "customer" | "ai"; text: string }>>([]);
  const [draft, setDraft] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    },
    [],
  );

  const sendMessage = (message: string) => {
    const text = message.trim();
    if (!text || isReplying) return;
    setMessages((current) => [...current, { from: "customer", text }]);
    setDraft("");
    setIsReplying(true);
    replyTimer.current = setTimeout(() => {
      setMessages((current) => [...current, { from: "ai", text: getMessengerReply(text) }]);
      setIsReplying(false);
      replyTimer.current = null;
    }, 650);
  };

  return (
    <section className="relative overflow-hidden bg-accent-soft py-28 md:py-44">
      <Orbit className="-left-40 top-24 size-[500px]" />
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-[1fr_.8fr]">
        <Reveal>
          <Eyebrow>CUSTOMER MESSENGER</Eyebrow>
          <h2 className="section-title mt-6">A chat experience your customers actually enjoy.</h2>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Helpful from the first hello. Personal at every step.
          </p>
        </Reveal>
        <Reveal delay={0.15} className="relative">
          <div className="phone-stage">
            <div className="store-page">
              <div className="h-44 rounded-lg bg-secondary" />
              <div className="mt-4 h-3 w-2/3 rounded bg-secondary" />
              <div className="mt-2 h-3 w-1/2 rounded bg-secondary" />
            </div>
            <div className="chat-widget">
              <div className="bg-ink p-5 text-dark-foreground">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <strong className="block text-sm">Nexa AI</strong>
                    <span className="text-[10px] text-dark-muted">Typically replies instantly</span>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed">Hi! How can I help you today?</p>
              </div>
              <div className="messenger-body">
                {messages.length === 0 ? (
                  <div className="space-y-2">
                    {["Track my order", "Return an item", "Talk to support", "Browse products"].map(
                      (prompt) => (
                        <button
                          type="button"
                          className="quick-action"
                          key={prompt}
                          disabled={isReplying}
                          onClick={() => sendMessage(prompt)}
                        >
                          {prompt}
                          <ArrowRight className="size-3" />
                        </button>
                      ),
                    )}
                  </div>
                ) : (
                  <div
                    className="messenger-thread"
                    role="log"
                    aria-label="Chat messages"
                    aria-live="polite"
                  >
                    {messages.map((message, index) => (
                      <div
                        className={`messenger-bubble ${message.from === "customer" ? "messenger-bubble-customer" : "messenger-bubble-ai"}`}
                        key={`${message.from}-${index}`}
                      >
                        {message.text}
                      </div>
                    ))}
                    {isReplying && (
                      <div className="messenger-bubble messenger-bubble-ai" role="status">
                        Nexa is replying...
                      </div>
                    )}
                  </div>
                )}
                <form
                  className="messenger-composer"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage(draft);
                  }}
                >
                  <label className="sr-only" htmlFor="nexa-messenger-message">
                    Message Nexa AI
                  </label>
                  <input
                    id="nexa-messenger-message"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={280}
                    placeholder="Ask a question..."
                    disabled={isReplying}
                  />
                  <button
                    type="submit"
                    aria-label="Send message"
                    disabled={!draft.trim() || isReplying}
                  >
                    <Send className="size-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const industries = [
  ["E-commerce", "Turn product questions into confident purchases.", commerceImage],
  ["Healthcare", "Make every patient interaction feel cared for.", healthcareImage],
  ["Education", "Guide every learner with clear, instant support.", educationImage],
  ["SaaS", "Scale expertise without losing the human touch.", saasImage],
];
function Industries() {
  return (
    <section className="py-28 md:py-44">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <Eyebrow>BUILT FOR YOUR WORLD</Eyebrow>
          <h2 className="section-title mt-6 max-w-3xl">
            One intelligence.
            <br />
            Every industry.
          </h2>
        </Reveal>
        <div className="mt-16 divide-y divide-border border-y border-border">
          {industries.map(([name, desc, img], i) => (
            <motion.article whileHover="hover" key={name} className="industry-row group">
              <div className="overflow-hidden rounded-lg">
                <motion.img
                  variants={{ hover: { scale: 1.03 } }}
                  transition={{ duration: 0.6, ease }}
                  src={img}
                  alt={`${name} customer experience`}
                  width={1200}
                  height={912}
                  loading="lazy"
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">0{i + 1}</span>
                <motion.h3
                  variants={{ hover: { x: 8 } }}
                  className="mt-3 text-4xl font-medium md:text-6xl"
                >
                  {name}
                </motion.h3>
                <p className="mt-4 text-muted-foreground">{desc}</p>
              </div>
              <motion.div
                variants={{ hover: { opacity: 1, x: 0 } }}
                initial={{ opacity: 0.2, x: -8 }}
                className="grid size-12 place-items-center rounded-full border border-border"
              >
                <ArrowRight />
              </motion.div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let id = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1300, 1);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}
function Stats() {
  return (
    <section className="border-y border-border py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-2 px-6 lg:grid-cols-4">
        {[
          [82, "%", "AI resolution"],
          [12, " sec", "Average response"],
          [94, "%", "Customer satisfaction"],
          [10, "K+", "Conversations"],
        ].map(([n, s, l]) => (
          <div className="stat" key={l as string}>
            <strong>
              <Counter to={n as number} suffix={s as string} />
            </strong>
            <span>{l}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="py-28 md:py-44">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.2fr_.65fr]">
        <Reveal>
          <span className="text-7xl text-primary/35">“</span>
          <blockquote className="-mt-5 text-4xl font-medium leading-tight md:text-6xl">
            Nexa completely changed the way our team handles customer conversations.
          </blockquote>
          <div className="mt-10">
            <strong className="block text-sm">Sarah Miller</strong>
            <span className="mt-1 block text-sm text-muted-foreground">
              Head of Customer Experience · Arc & Co.
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.15} className="image-reveal">
          <img
            className="aspect-[4/5] w-full rounded-xl object-cover"
            src={sarahImage}
            alt="Sarah Miller, Head of Customer Experience"
            width={1008}
            height={1264}
            loading="lazy"
          />
        </Reveal>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-dark py-28 text-center text-dark-foreground md:py-44"
    >
      <motion.div
        className="cta-orbit"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <Reveal>
          <Eyebrow dark>START TODAY</Eyebrow>
          <h2 className="section-title mx-auto mt-6 max-w-4xl">
            Your customers are already talking.
            <br />
            Start listening.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-dark-muted">
            Bring AI and human support together in one intelligent workspace.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg">
              Start Free Trial <ArrowRight className="size-4" />
            </Button>
            <Button variant="dark" size="lg">
              Book a Demo
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="resources" className="bg-dark px-6 pb-10 text-dark-foreground">
      <div className="mx-auto max-w-7xl border-t border-dark-border pt-16">
        <div className="grid gap-12 md:grid-cols-[1.2fr_2fr]">
          <div>
            <a href="#top" className="text-3xl font-semibold">
              Nexa<span className="text-primary">.</span>
            </a>
            <p className="mt-4 text-sm text-dark-muted">AI-powered customer conversations.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              ["Product", "Inbox", "AI Agent", "Messenger"],
              ["Solutions", "E-commerce", "Healthcare", "SaaS"],
              ["Resources", "Guides", "Customers", "API"],
              ["Company", "About", "Careers", "Contact"],
            ].map(([h, ...links]) => (
              <div key={h}>
                <strong className="text-xs">{h}</strong>
                {links.map((x) => (
                  <a
                    href="#top"
                    className="mt-3 block text-xs text-dark-muted transition-colors hover:text-dark-foreground"
                    key={x}
                  >
                    {x}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-20 flex flex-col justify-between gap-4 border-t border-dark-border pt-6 text-xs text-dark-muted sm:flex-row">
          <span>© 2026 Nexa, Inc.</span>
          <div className="flex gap-4">
            <Instagram className="size-4" />
            <Globe2 className="size-4" />
            <MessageCircle className="size-4" />
          </div>
        </div>
        <div className="mt-10 overflow-hidden text-[18vw] font-semibold leading-[.8] text-dark-surface">
          NEXA
        </div>
      </div>
    </footer>
  );
}

export function NexaPage() {
  const reduced = useReducedMotion();
  return (
    <div className={reduced ? "reduce-motion" : ""}>
      <Navbar />
      <main>
        <Hero />
        <StoryTransition />
        <InboxSection />
        <AIAgent />
        <Knowledge />
        <Workflow />
        <InteractiveDemo />
        <ReplyLab />
        <Integrations />
        <MessengerSection />
        <Industries />
        <Stats />
        <Testimonial />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
