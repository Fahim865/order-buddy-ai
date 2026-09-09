import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nova Support — AI Order Tracking Agent" },
      {
        name: "description",
        content:
          "Chat with Nova, an AI customer support agent that looks up live order status, tracking numbers and delivery dates automatically.",
      },
      { property: "og:title", content: "Nova Support — AI Order Tracking Agent" },
      {
        property: "og:description",
        content:
          "An AI support agent with automated tool calling for instant order tracking and a developer log panel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Msg = { role: "user" | "assistant"; content: string };

const SAMPLES = ["ORD-1001", "ORD-1002", "ORD-1003", "ORD-1004"];

function Index() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi there! I'm Nova from customer support. Ask me anything — if you share an order ID like ORD-1001 I'll look it up right away.",
    },
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Idle");
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setStatus("Thinking…");

    const hasOrder = /ORD-\d+/i.test(trimmed);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (hasOrder) {
      timer = setTimeout(() => setStatus("Executing tool: get_order_status"), 500);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (data.logs) setLogs((l) => [...l, ...data.logs]);
      if (!res.ok) {
        setMessages([
          ...next,
          { role: "assistant", content: data.error ?? "Something went wrong. Please try again." },
        ]);
      } else {
        setMessages([...next, { role: "assistant", content: data.reply || "…" }]);
      }
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "I couldn't reach the support service. Please try again." },
      ]);
    } finally {
      if (timer) clearTimeout(timer);
      setBusy(false);
      setStatus("Idle");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Support Console
          </p>
          <h1 className="mt-1 text-3xl font-semibold">
            <span className="brand-gradient-text">Nova</span> AI Support Agent
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium">
            <span
              className={`h-2 w-2 rounded-full ${busy ? "bg-accent typing-dot" : "bg-primary"}`}
            />
            AI Status: {status}
          </span>
          <button
            onClick={() => setShowLogs((v) => !v)}
            className="rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            {showLogs ? "Hide" : "Show"} Developer Logs
          </button>
        </div>
      </header>

      <div className="grid flex-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="panel flex min-h-[70vh] flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`animate-message-in flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-secondary text-secondary-foreground"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="animate-message-in flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-secondary px-4 py-3.5">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s}
                  onClick={() => send(`Where is my order ${s}?`)}
                  disabled={busy}
                  className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about an order, e.g. Where is ORD-1001?"
                className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </div>
        </section>

        {showLogs && (
          <aside className="panel flex max-h-[70vh] flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">Developer Logs / Agent Thought Process</h2>
              <button
                onClick={() => setLogs([])}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {logs.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No events yet. Send a message to see the raw payloads, tool calls and results.
                </p>
              )}
              {logs.map((log, i) => (
                <div key={i} className="rounded-lg border border-border bg-background/60 p-3">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-accent">
                    {String(log.type)}
                  </p>
                  <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-muted-foreground">
                    {JSON.stringify(log, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
