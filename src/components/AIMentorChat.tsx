import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-mentor-chat`;

const QUICK_PROMPTS = [
  "Best career for me?",
  "Show scholarships",
  "Resume tips",
  "Govt job guidance",
  "Generate my roadmap",
  "Suggest colleges near me",
];

const FOLLOW_UP_SUGGESTIONS = [
  "Generate Roadmap",
  "Show Colleges",
  "Govt Jobs",
  "Improve Resume",
  "Analyze Skills",
  "Career Twin",
];

// Animated robot SVG component
const AnimatedRobot = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className="animate-float">
    <defs>
      <linearGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--accent, var(--primary)))" />
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="24" height="20" rx="6" fill="url(#robotGrad)" opacity="0.9" />
    <line x1="20" y1="8" x2="20" y2="3" stroke="currentColor" strokeWidth="2" opacity="0.6" />
    <circle cx="20" cy="2" r="2" fill="currentColor" opacity="0.5" className="animate-pulse" />
    <circle cx="15" cy="17" r="2.5" fill="white">
      <animate attributeName="r" values="2.5;1;2.5" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="25" cy="17" r="2.5" fill="white">
      <animate attributeName="r" values="2.5;1;2.5" dur="3s" repeatCount="indefinite" />
    </circle>
    <rect x="14" y="22" width="12" height="2" rx="1" fill="white" opacity="0.7" />
    <rect x="12" y="30" width="16" height="6" rx="3" fill="url(#robotGrad)" opacity="0.7" />
  </svg>
);

export default function AIMentorChat() {
  const { user, session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && user && messages.length === 0) loadLastSession();
  }, [isOpen, user]);

  const loadLastSession = async () => {
    if (!user) return;
    const { data: sessions } = await supabase
      .from("mentor_chat_sessions")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (sessions && sessions.length > 0) {
      const sid = sessions[0].id;
      setSessionId(sid);
      const { data: msgs } = await supabase
        .from("mentor_chat_messages")
        .select("role, content")
        .eq("session_id", sid)
        .order("created_at", { ascending: true })
        .limit(30);
      if (msgs && msgs.length > 0) setMessages(msgs as Msg[]);
    }
  };

  const ensureSession = async (): Promise<string> => {
    if (sessionId) return sessionId;
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("mentor_chat_sessions")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    if (error) throw error;
    setSessionId(data.id);
    return data.id;
  };

  const saveMessage = async (sid: string, role: string, content: string) => {
    if (!user) return;
    await supabase.from("mentor_chat_messages").insert({ session_id: sid, user_id: user.id, role, content });
  };

  const copyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const streamChat = useCallback(async (allMessages: Msg[]) => {
    if (!session?.access_token) { toast.error("Please log in to use AI Mentor"); return; }

    setIsLoading(true);
    let assistantSoFar = "";
    abortRef.current = new AbortController();

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ messages: allMessages.slice(-10) }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        if (resp.status === 429) toast.error("Too many requests.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error(errData.error || "Failed to get response");
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No stream body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch { /* partial JSON */ }
        }
      }

      if (assistantSoFar) {
        try { const sid = await ensureSession(); await saveMessage(sid, "assistant", assistantSoFar); } catch { /* non-critical */ }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") { console.error(e); toast.error("Connection error"); }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [session, sessionId]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    try { const sid = await ensureSession(); await saveMessage(sid, "user", msg); } catch { /* non-critical */ }
    await streamChat(newMessages);
  };

  const clearChat = async () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setIsLoading(false);
    setSessionId(null);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button - positioned above mobile nav, below admin button area */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-40 md:bottom-6 md:right-6 h-13 w-13 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
          aria-label="Open AI Mentor"
        >
          <AnimatedRobot size={26} />
          <span className="absolute -inset-0.5 rounded-2xl border border-primary/30 animate-glow-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 md:inset-auto md:bottom-6 md:right-6 md:w-[400px] md:h-[600px] md:rounded-2xl flex flex-col bg-background border border-border/50 shadow-2xl animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-foreground/15 flex items-center justify-center backdrop-blur-sm">
                <AnimatedRobot size={20} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm">AVSAR AI Mentor</h3>
                <p className="text-[10px] opacity-75">🟢 Online</p>
              </div>
            </div>
            <div className="flex gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground/80 hover:bg-primary-foreground/15 hover:text-primary-foreground" onClick={clearChat} title="New chat">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground/80 hover:bg-primary-foreground/15 hover:text-primary-foreground" onClick={() => setIsOpen(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center mb-3">
                  <AnimatedRobot size={32} />
                </div>
                <p className="text-sm text-muted-foreground mb-4">Hi! I'm your AI Career Mentor.</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {QUICK_PROMPTS.map(p => (
                    <button key={p} onClick={() => send(p)} className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/40 text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shrink-0 mt-1">
                    <AnimatedRobot size={14} />
                  </div>
                )}
                <div className={cn("relative group max-w-[80%]")}>
                  <div className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/60 text-foreground rounded-bl-md border border-border/30"
                  )}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>pre]:bg-background/50 [&>pre]:rounded-lg [&>pre]:p-2 [&>pre]:text-xs [&>code]:text-xs [&>code]:bg-background/50 [&>code]:px-1 [&>code]:rounded">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}
                  </div>
                  {msg.role === "assistant" && msg.content && (
                    <button onClick={() => copyMessage(msg.content, i)} className="absolute -bottom-5 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                      {copiedIdx === i ? <><Check className="h-3 w-3" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shrink-0">
                  <AnimatedRobot size={14} />
                </div>
                <div className="bg-muted/60 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Smart Suggestions */}
          {messages.length > 0 && !isLoading && messages[messages.length - 1]?.role === "assistant" && (
            <div className="shrink-0 px-3 py-2 border-t border-border/40 bg-muted/20">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {FOLLOW_UP_SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} className="text-[11px] px-2.5 py-1 rounded-full border border-border hover:border-primary/30 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all whitespace-nowrap shrink-0">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 border-t border-border/40 p-3 bg-background">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask about careers, colleges..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              />
              <Button onClick={() => send()} disabled={!input.trim() || isLoading} size="icon" className="rounded-xl shrink-0 h-9 w-9">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
