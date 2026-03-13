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
  Phone,
  ExternalLink,
  Loader2,
  X,
  Sparkles,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AgentEvent {
  type: "thinking" | "tool_call" | "tool_result" | "finding" | "summary" | "saved" | "error" | "done";
  content?: string;
  tool?: string;
  input?: string;
  result?: string;
  data?: DealerSearchResult;
}

interface Vehicle {
  year: number;
  make: string;
  model: string;
  trim?: string;
  price?: number;
  mileage?: number;
  stock?: string;
  condition?: string;
}

interface Dealer {
  name: string;
  url: string;
  address?: string;
  phone?: string;
  distance_estimate?: string;
  vehicles: Vehicle[];
}

interface DealerSearchResult {
  dealers: Dealer[];
  total_vehicles_found: number;
  search_summary: string;
}

interface DealerAgentPanelProps {
  onClose?: () => void;
  defaultLocation?: string;
}

export function DealerAgentPanel({ onClose, defaultLocation }: DealerAgentPanelProps) {
  const [location, setLocation] = useState(defaultLocation ?? "");
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [result, setResult] = useState<DealerSearchResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [expandedLog, setExpandedLog] = useState(false);
  const [expandedDealer, setExpandedDealer] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addEvent = useCallback((event: AgentEvent) => {
    setEvents((prev) => [...prev, event]);
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  const runAgent = useCallback(async () => {
    if (!location.trim() || !vehicleQuery.trim()) return;

    setEvents([]);
    setResult(null);
    setIsDone(false);
    setIsRunning(true);
    setExpandedLog(true);

    abortRef.current = new AbortController();

    try {
      const resp = await fetch("/api/agent/dealer-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, vehicleQuery, maxDealers: 3 }),
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
              setResult(event.data as DealerSearchResult);
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
  }, [location, vehicleQuery, addEvent]);

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
            style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
          >
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Dealer Scout Agent</h2>
            <p className="text-[10px] text-white/40">AI-powered live inventory search</p>
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
        <div className="space-y-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Your city or zip code (e.g. Austin, TX)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isRunning}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all disabled:opacity-50"
            />
          </div>
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="What are you looking for? (e.g. used Toyota RAV4)"
              value={vehicleQuery}
              onChange={(e) => setVehicleQuery(e.target.value)}
              disabled={isRunning}
              onKeyDown={(e) => e.key === "Enter" && !isRunning && runAgent()}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all disabled:opacity-50"
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
              disabled={!location.trim() || !vehicleQuery.trim()}
              className="w-full h-10 font-medium"
              style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isDone ? "Run Again" : "Find Dealers & Scan Inventory"}
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
                {isRunning && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                {isDone && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                Agent activity log ({events.length} steps)
              </span>
              {expandedLog ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {expandedLog && (
              <div className="px-4 pb-3 space-y-1.5 max-h-56 overflow-y-auto">
                {events.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    {ev.type === "thinking" && (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
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
                        <Database className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                        <span className="text-violet-300/70">{ev.content}</span>
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
              <h3 className="text-sm font-semibold text-white/90">
                {result.dealers.length} Dealers Found
              </h3>
              <Badge variant="glass" className="text-[10px]">
                {result.total_vehicles_found} vehicles
              </Badge>
            </div>
            <p className="text-[11px] text-white/40">{result.search_summary}</p>

            {result.dealers.map((dealer, idx) => (
              <div
                key={idx}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <button
                  onClick={() => setExpandedDealer(expandedDealer === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white/90 truncate">{dealer.name}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {dealer.address && (
                        <span className="text-[10px] text-white/40 truncate">{dealer.address}</span>
                      )}
                      {dealer.distance_estimate && (
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-white/10 text-white/40 shrink-0">
                          {dealer.distance_estimate}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <Badge variant="glass" className="text-[10px]">
                      {dealer.vehicles.length} vehicles
                    </Badge>
                    {expandedDealer === idx ? <ChevronUp className="w-3.5 h-3.5 text-white/40" /> : <ChevronDown className="w-3.5 h-3.5 text-white/40" />}
                  </div>
                </button>

                {expandedDealer === idx && (
                  <div className="border-t border-white/[0.05] px-4 pb-4">
                    {/* Actions */}
                    <div className="flex gap-2 py-3">
                      {dealer.phone && (
                        <a
                          href={`tel:${dealer.phone}`}
                          className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
                        >
                          <Phone className="w-3 h-3" />
                          {dealer.phone}
                        </a>
                      )}
                      {dealer.url && (
                        <a
                          href={dealer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Website
                        </a>
                      )}
                    </div>

                    {/* Vehicle list */}
                    {dealer.vehicles.length > 0 ? (
                      <div className="space-y-2">
                        {dealer.vehicles.map((v, vi) => (
                          <div
                            key={vi}
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                          >
                            <div>
                              <span className="text-sm font-medium text-white/85">
                                {v.year} {v.make} {v.model}
                                {v.trim ? <span className="text-white/40 text-xs"> {v.trim}</span> : null}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {v.condition && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] py-0 px-1.5 border-white/10 text-white/40"
                                  >
                                    {v.condition}
                                  </Badge>
                                )}
                                {v.mileage != null && (
                                  <span className="text-[10px] text-white/30">
                                    {v.mileage.toLocaleString()} mi
                                  </span>
                                )}
                                {v.stock && (
                                  <span className="text-[10px] text-white/20">#{v.stock}</span>
                                )}
                              </div>
                            </div>
                            {v.price != null ? (
                              <div className="text-right">
                                <div className="text-sm font-bold text-blue-400">
                                  ${v.price.toLocaleString()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-white/30">Call for price</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-white/30 py-2">
                        No inventory data extracted — visit their website directly.
                      </p>
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
