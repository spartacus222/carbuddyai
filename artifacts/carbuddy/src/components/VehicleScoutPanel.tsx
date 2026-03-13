import React, { useState, useRef, useCallback } from "react";
import {
  Search,
  Globe,
  FileText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Car,
  DollarSign,
  Loader2,
  X,
  Sparkles,
  Database,
  ExternalLink,
  Calendar,
  Gauge,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AgentEvent {
  type: "thinking" | "tool_call" | "tool_result" | "finding" | "summary" | "saved" | "error" | "done";
  content?: string;
  tool?: string;
  input?: string;
  result?: string;
  data?: ScoutResult;
}

interface FoundListing {
  year: number;
  make: string;
  model: string;
  trim?: string;
  condition?: string;
  color?: string;
  price?: number;
  mileage?: number;
  dealer_name?: string;
  dealer_city?: string;
  dealer_state?: string;
  dealer_phone?: string;
  source_url?: string;
  source_site?: string;
  description?: string;
}

interface ScoutResult {
  listings: FoundListing[];
  total_found: number;
  search_summary: string;
}

interface VehicleScoutPanelProps {
  onClose?: () => void;
  defaultLocation?: string;
}

export function VehicleScoutPanel({ onClose, defaultLocation }: VehicleScoutPanelProps) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [location, setLocation] = useState(defaultLocation ?? "");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [result, setResult] = useState<ScoutResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [expandedLog, setExpandedLog] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addEvent = useCallback((event: AgentEvent) => {
    setEvents((prev) => [...prev, event]);
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  const canRun = make.trim() && model.trim() && location.trim();

  const runAgent = useCallback(async () => {
    if (!canRun) return;

    setEvents([]);
    setResult(null);
    setIsDone(false);
    setIsRunning(true);
    setExpandedLog(true);

    abortRef.current = new AbortController();

    try {
      const body: Record<string, unknown> = { make: make.trim(), model: model.trim(), location: location.trim() };
      if (yearMin) body.yearMin = parseInt(yearMin);
      if (yearMax) body.yearMax = parseInt(yearMax);
      if (priceMax) body.priceMax = parseInt(priceMax.replace(/[^0-9]/g, ""));

      const resp = await fetch("/api/agent/vehicle-scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) throw new Error(`API error ${resp.status}`);
      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json) continue;
          try {
            const event: AgentEvent = JSON.parse(json);
            addEvent(event);
            if (event.type === "finding" && event.data) {
              setResult(event.data as ScoutResult);
            }
            if (event.type === "done") {
              setIsDone(true);
              setIsRunning(false);
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        addEvent({ type: "error", content: `Connection error: ${err.message}` });
      }
    } finally {
      setIsRunning(false);
    }
  }, [make, model, yearMin, yearMax, priceMax, location, canRun, addEvent]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
  }, []);

  const toolIcon = (tool?: string) =>
    tool === "search_web" ? (
      <Search className="w-3.5 h-3.5 text-blue-400 shrink-0" />
    ) : (
      <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
    );

  const priceColor = (price?: number) => {
    if (!price) return "text-white/40";
    if (price < 20000) return "text-green-400";
    if (price < 30000) return "text-blue-400";
    return "text-orange-400";
  };

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: "rgba(8,11,20,0.97)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #059669, #2563eb)" }}
          >
            <Car className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Vehicle Scout Agent</h2>
            <p className="text-[10px] text-white/40">Finds real listings from the web</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Input form */}
        <div className="space-y-2.5">
          {/* Make / Model row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Car className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <input
                type="text"
                placeholder="Make (Toyota)"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                disabled={isRunning}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/50 transition-all disabled:opacity-50"
              />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Model (Camry)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={isRunning}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/50 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Year range row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <input
                type="number"
                placeholder="Year from (2020)"
                value={yearMin}
                onChange={(e) => setYearMin(e.target.value)}
                disabled={isRunning}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/50 transition-all disabled:opacity-50"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Year to (2024)"
                value={yearMax}
                onChange={(e) => setYearMax(e.target.value)}
                disabled={isRunning}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/50 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Price + Location row */}
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              type="text"
              placeholder="Max price (25000)"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              disabled={isRunning}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/50 transition-all disabled:opacity-50"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              type="text"
              placeholder="Location (Austin, TX)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isRunning}
              onKeyDown={(e) => e.key === "Enter" && !isRunning && runAgent()}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/50 transition-all disabled:opacity-50"
            />
          </div>

          {isRunning ? (
            <Button
              onClick={stop}
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 h-10"
            >
              <X className="w-4 h-4 mr-2" />
              Stop Agent
            </Button>
          ) : (
            <Button
              onClick={runAgent}
              disabled={!canRun}
              className="w-full h-10 font-medium"
              style={{ background: "linear-gradient(135deg, #059669, #2563eb)" }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isDone ? "Search Again" : "Scout the Web for Listings"}
            </Button>
          )}
        </div>

        {/* Agent Live Log */}
        {events.length > 0 && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          >
            <button
              onClick={() => setExpandedLog((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] text-white/50 hover:text-white/70 transition-colors"
            >
              <span className="flex items-center gap-2">
                {isRunning && <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />}
                {isDone && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                Agent activity ({events.length} steps)
              </span>
              {expandedLog ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {expandedLog && (
              <div className="px-4 pb-3 space-y-1.5 max-h-52 overflow-y-auto">
                {events.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    {ev.type === "thinking" && (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-white/60">{ev.content}</span>
                      </>
                    )}
                    {ev.type === "tool_call" && (
                      <>
                        {toolIcon(ev.tool)}
                        <span className="text-white/70">
                          <span className="text-white/40">{ev.tool === "search_web" ? "Searching: " : "Reading: "}</span>
                          <span className="font-mono">{ev.input?.slice(0, 70)}{(ev.input?.length ?? 0) > 70 ? "…" : ""}</span>
                        </span>
                      </>
                    )}
                    {ev.type === "tool_result" && (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400/70 mt-0.5 shrink-0" />
                        <span className="text-white/40">{ev.result}</span>
                      </>
                    )}
                    {ev.type === "saved" && (
                      <>
                        <Database className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-emerald-300/70">{ev.content}</span>
                      </>
                    )}
                    {ev.type === "error" && (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                        <span className="text-red-400">{ev.content}</span>
                      </>
                    )}
                    {ev.type === "done" && !result && (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                        <span className="text-green-400">{ev.content}</span>
                      </>
                    )}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                {result.listings.length} Listings Found
              </h3>
              <a
                href="/listings"
                className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary transition-colors"
              >
                <List className="w-3 h-3" />
                View all
              </a>
            </div>
            <p className="text-[11px] text-white/40">{result.search_summary}</p>

            {result.listings.map((listing, idx) => (
              <div
                key={idx}
                className="rounded-xl p-3 space-y-1.5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white/90">
                      {listing.year} {listing.make} {listing.model}
                      {listing.trim && <span className="text-white/45 font-normal"> {listing.trim}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {listing.condition && (
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-white/10 text-white/40">
                          {listing.condition}
                        </Badge>
                      )}
                      {listing.color && (
                        <span className="text-[10px] text-white/30">{listing.color}</span>
                      )}
                      {listing.mileage != null && (
                        <span className="text-[10px] text-white/40 flex items-center gap-0.5">
                          <Gauge className="w-2.5 h-2.5" />
                          {listing.mileage.toLocaleString()} mi
                        </span>
                      )}
                      {listing.source_site && (
                        <Badge variant="glass" className="text-[9px] py-0 px-1.5">
                          {listing.source_site}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {listing.price != null ? (
                      <div className={`text-sm font-bold ${priceColor(listing.price)}`}>
                        ${listing.price.toLocaleString()}
                      </div>
                    ) : (
                      <span className="text-[11px] text-white/30">Call for price</span>
                    )}
                  </div>
                </div>

                {(listing.dealer_name || listing.source_url) && (
                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                    <span className="text-[10px] text-white/30 truncate">
                      {listing.dealer_name}
                      {(listing.dealer_city || listing.dealer_state) &&
                        ` — ${[listing.dealer_city, listing.dealer_state].filter(Boolean).join(", ")}`}
                    </span>
                    {listing.source_url && (
                      <a
                        href={listing.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-primary/60 hover:text-primary transition-colors shrink-0 ml-2"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        View listing
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
