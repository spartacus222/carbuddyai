import React, { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { Car, Globe, Heart, Loader2, MapPin, Pencil, Send, Sparkles, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ShortlistPanel } from "@/components/ShortlistPanel";
import { DealerAgentPanel } from "@/components/DealerAgentPanel";
import { VehicleScoutPanel } from "@/components/VehicleScoutPanel";
import { MessageBubble } from "@/components/MessageBubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useGetOpenaiConversation, useListOpenaiMessages, useGetShortlist } from "@workspace/api-client-react";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useUserLocation } from "@/hooks/use-user-location";

type RightPanel = "shortlist" | "agent" | "scout" | null;

function LocationBadge() {
  const { location, updateLocation } = useUserLocation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(location.label);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 30);
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) updateLocation(trimmed);
    setEditing(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(false);
  };

  if (location.loading) {
    return (
      <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/30 px-2.5 py-1 rounded-full border border-white/[0.07] bg-white/[0.02]">
        <Loader2 className="w-3 h-3 animate-spin" />
        Detecting location…
      </span>
    );
  }

  if (editing) {
    return (
      <div className="hidden sm:flex items-center gap-1 text-[12px]">
        <MapPin className="w-3 h-3 text-white/30 shrink-0" />
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          className="bg-white/[0.06] border border-primary/40 rounded-lg px-2 py-0.5 text-white text-[12px] outline-none w-40"
          placeholder="City, State"
          autoFocus
        />
        <button onClick={() => setEditing(false)} className="text-white/30 hover:text-white/60">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/40 px-2.5 py-1 rounded-full border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:text-white/60 transition-all group"
      title="Click to change location"
    >
      <MapPin className="w-3 h-3 shrink-0" />
      <span>{location.label || "Set location"}</span>
      <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
    </button>
  );
}

export default function ChatSession() {
  const { id } = useParams<{ id: string }>();
  const convId = parseInt(id, 10);

  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { location } = useUserLocation();
  const { data: conversation } = useGetOpenaiConversation(convId);
  const { data: messages = [] } = useListOpenaiMessages(convId);
  const { data: shortlist } = useGetShortlist();
  const { sendMessage, isStreaming, streamedContent } = useChatStream(convId);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages, streamedContent, isStreaming]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage({ content: input.trim() });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const togglePanel = (panel: RightPanel) => {
    setRightPanel((prev) => (prev === panel ? null : panel));
  };

  const quickChips = [
    "Compare trims",
    "Check market price",
    "Find dealers near me",
    "Find listings near me",
    "Safety ratings",
  ];

  const shortlistCount = shortlist?.length ?? 0;

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#080b14]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute rounded-full opacity-[0.04] blur-[130px] w-[700px] h-[700px] -top-[150px] left-[100px] bg-blue-600" />
        <div className="absolute rounded-full opacity-[0.03] blur-[120px] w-[500px] h-[500px] bottom-0 right-[100px] bg-indigo-600" />
      </div>

      <Sidebar />

      <main className="flex-1 flex flex-col relative z-10 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-[60px] flex-shrink-0 flex items-center justify-between px-6 border-b border-white/[0.05] bg-white/[0.01] backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-medium text-[15px] text-white/85 truncate">
              {conversation?.title || "New Conversation"}
            </span>
            <LocationBadge />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => togglePanel("scout")}
              title="Vehicle Scout — find real listings"
              className={`rounded-xl transition-all ${
                rightPanel === "scout"
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-white/35 hover:text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <Car className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => togglePanel("agent")}
              title="Dealer Scout"
              className={`rounded-xl transition-all ${
                rightPanel === "agent"
                  ? "text-violet-400 bg-violet-500/10"
                  : "text-white/35 hover:text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <Globe className="w-4 h-4" />
            </Button>
            <button
              onClick={() => togglePanel("shortlist")}
              title="My Shortlist"
              className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                rightPanel === "shortlist"
                  ? "text-rose-400 bg-rose-500/10"
                  : "text-white/35 hover:text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-all ${rightPanel === "shortlist" ? "fill-rose-400/30" : ""}`}
              />
              {shortlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {shortlistCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1">
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-6 pb-44">
            {messages.length === 0 && !isStreaming && (
              <div className="text-center py-24">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #1d4ed8, #4338ca)" }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-white/40 text-sm">Ask anything about cars, pricing, or comparisons.</p>
                {location.label && !location.loading && (
                  <p className="text-white/20 text-xs mt-2">
                    Showing inventory near <span className="text-white/35">{location.label}</span>
                  </p>
                )}
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role as "user" | "assistant"}
                content={msg.content}
              />
            ))}

            {isStreaming && streamedContent && (
              <MessageBubble role="assistant" content={streamedContent} isStreaming />
            )}

            {isStreaming && !streamedContent && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex-shrink-0" />
                <div className="h-10 w-28 rounded-2xl bg-white/[0.04] mt-1" />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none bg-gradient-to-t from-[#080b14] via-[#080b14]/95 to-transparent" />
          <div className="max-w-2xl mx-auto relative z-10">
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              {quickChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (chip === "Find dealers near me") {
                      togglePanel("agent");
                    } else if (chip === "Find listings near me") {
                      togglePanel("scout");
                    } else {
                      setInput(chip);
                    }
                  }}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                    chip === "Find dealers near me"
                      ? "text-violet-300 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/15"
                      : chip === "Find listings near me"
                      ? "text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15"
                      : "text-white/50 bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] hover:text-white/80"
                  }`}
                >
                  {chip === "Find dealers near me" && (
                    <Globe className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                  )}
                  {chip === "Find listings near me" && (
                    <Car className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                  )}
                  {chip}
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} className="relative group">
              <div
                className="absolute -inset-px rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg,rgba(37,99,235,0.25),rgba(79,70,229,0.25))",
                  filter: "blur(8px)",
                }}
              />
              <div
                className="relative flex items-end gap-2 rounded-2xl p-2 shadow-2xl"
                style={{
                  background: "rgba(13,17,32,0.85)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 max-h-32 min-h-[44px] bg-transparent border-0 resize-none outline-none py-3 px-2 text-[15px] text-white placeholder:text-white/25 leading-relaxed"
                  placeholder="Ask anything about vehicles, pricing, or comparisons…"
                  rows={1}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className="h-10 w-10 rounded-xl shrink-0 transition-all duration-200"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
              </div>
            </form>
            <p className="text-center mt-3 text-[10px] text-white/20 tracking-wide">
              Verify details with the dealer • CarBuddy uses live inventory data
            </p>
          </div>
        </div>
      </main>

      {/* Overlay panels */}
      {rightPanel === "shortlist" && (
        <div
          className="absolute inset-y-0 right-0 z-30 w-[320px] animate-in slide-in-from-right-4 duration-250"
          style={{ filter: "drop-shadow(-8px 0 32px rgba(0,0,0,0.6))" }}
        >
          <ShortlistPanel isOpen onClose={() => setRightPanel(null)} />
        </div>
      )}

      {rightPanel === "agent" && (
        <div
          className="absolute inset-y-0 right-0 z-30 w-[380px] animate-in slide-in-from-right-4 duration-250"
          style={{ filter: "drop-shadow(-8px 0 32px rgba(0,0,0,0.6))" }}
        >
          <DealerAgentPanel
            onClose={() => setRightPanel(null)}
            defaultLocation={location.label}
          />
        </div>
      )}

      {rightPanel === "scout" && (
        <div
          className="absolute inset-y-0 right-0 z-30 w-[380px] animate-in slide-in-from-right-4 duration-250"
          style={{ filter: "drop-shadow(-8px 0 32px rgba(0,0,0,0.6))" }}
        >
          <VehicleScoutPanel
            onClose={() => setRightPanel(null)}
            defaultLocation={location.label}
          />
        </div>
      )}
    </div>
  );
}
