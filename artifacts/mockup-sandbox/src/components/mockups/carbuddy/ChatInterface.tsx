import React, { useState } from "react";
import {
  Car, MessageSquare, Plus, MapPin,
  User, Send, Heart, BarChart3,
  ShieldCheck, PanelRightClose, PanelRightOpen,
  Sparkles, ChevronDown, Zap, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ChatInterface() {
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  return (
    <div
      className="h-screen flex overflow-hidden text-white font-sans antialiased"
      style={{
        background: "linear-gradient(135deg, #080b14 0%, #0d1120 40%, #0a0e1a 100%)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute rounded-full opacity-[0.07] blur-3xl"
          style={{ width: 600, height: 600, top: -100, left: -100, background: "radial-gradient(circle, #3b82f6, transparent)" }}
        />
        <div
          className="absolute rounded-full opacity-[0.05] blur-3xl"
          style={{ width: 400, height: 400, bottom: 0, right: 200, background: "radial-gradient(circle, #6366f1, transparent)" }}
        />
      </div>

      {/* ── Sidebar ── */}
      <div
        className="relative z-10 w-[240px] flex-shrink-0 flex flex-col"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            <Car className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[15px] tracking-[-0.3px] text-white">CarBuddy</span>
          <Badge className="ml-auto text-[9px] px-1.5 py-0 h-4 border-0" style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}>AI</Badge>
        </div>

        {/* New chat button */}
        <div className="px-3 mb-4">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Plus className="w-4 h-4" />
            <span>New conversation</span>
          </button>
        </div>

        {/* Recents */}
        <div className="px-3 flex-1 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/25 px-2 mb-2">Recent</p>
          <div className="space-y-0.5">
            {[
              { label: "SUV under $35k", active: true },
              { label: "Tacoma comparison", active: false },
              { label: "EV options 2024", active: false },
              { label: "Reliable sedans", active: false },
            ].map((item, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-left transition-all"
                style={{
                  background: item.active ? "rgba(59,130,246,0.12)" : "transparent",
                  color: item.active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                  borderLeft: item.active ? "2px solid #3b82f6" : "2px solid transparent",
                }}
              >
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User */}
        <div
          className="mx-3 mb-3 flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Avatar className="w-7 h-7 flex-shrink-0">
            <AvatarFallback
              className="text-[11px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
            >JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-white/90 truncate">Jordan Davis</p>
            <p className="text-[10px] text-white/40 truncate">Pro Member</p>
          </div>
          <User className="w-3.5 h-3.5 text-white/30" />
        </div>
      </div>

      {/* ── Main chat ── */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="h-13 flex-shrink-0 flex items-center justify-between px-6"
          style={{
            height: 52,
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="font-medium text-[14px] text-white/90 tracking-[-0.2px]">SUV under $35k</span>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-white/50 cursor-pointer hover:text-white/80 transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <MapPin className="w-3 h-3" />
              <span>San Francisco, CA</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac" }}
            >
              <Zap className="w-3 h-3" />
              <span>Live inventory</span>
            </div>
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              {rightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6 lg:px-10 py-6">
          <div className="max-w-2xl mx-auto space-y-7 pb-40">

            {/* User bubble */}
            <div className="flex justify-end">
              <div
                className="px-4 py-3 rounded-2xl rounded-tr-sm text-[14px] leading-relaxed max-w-[80%]"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                  boxShadow: "0 4px 24px rgba(59,130,246,0.2)",
                }}
              >
                I'm looking for a reliable SUV under $35,000. I have 2 kids and need good cargo space.
              </div>
            </div>

            {/* AI bubble 1 */}
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #4338ca)", boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 space-y-3">
                <div
                  className="rounded-2xl rounded-tl-sm px-5 py-4 text-[14px] leading-relaxed text-white/85"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <p className="mb-4 text-white/80">
                    Great criteria. The mid-size SUV market has excellent options right now for families. I found{" "}
                    <span className="text-white font-medium">23 vehicles</span> near San Francisco matching your budget — here are the top 3:
                  </p>

                  {/* Inline mini-cards */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { name: "2024 Toyota RAV4", price: "$29,825", badge: "Best Match", badgeColor: "#3b82f6", accentColor: "#3b82f6", tags: ["37 MPG", "AWD"], img: "/images/rav4.png" },
                      { name: "2024 Honda CR-V", price: "$30,850", badge: "Most Reliable", badgeColor: "#22c55e", accentColor: "#22c55e", tags: ["Top Safety", "More Space"], img: "/images/crv.png" },
                      { name: "2024 Subaru Outback", price: "$28,895", badge: "Best Value", badgeColor: "#f59e0b", accentColor: "#f59e0b", tags: ["AWD Std", "Roomy"], img: "/images/outback.png" },
                    ].map((car, i) => (
                      <div
                        key={i}
                        className="rounded-xl overflow-hidden cursor-pointer group transition-all"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <div className="h-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(30,40,60,0.8), rgba(15,20,35,0.9))" }}>
                          <img
                            src={car.img}
                            alt={car.name}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className="absolute top-2 left-2">
                            <span
                              className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: `${car.badgeColor}22`, color: car.badgeColor, border: `1px solid ${car.badgeColor}44` }}
                            >
                              {car.badge}
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5">
                          <p className="text-[12px] font-semibold text-white/90 leading-tight truncate">{car.name}</p>
                          <p className="text-[13px] font-bold mt-0.5" style={{ color: car.accentColor }}>{car.price}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {car.tags.map((t, j) => (
                              <span key={j} className="text-[9px] px-1.5 py-0.5 rounded-md text-white/50" style={{ background: "rgba(255,255,255,0.05)" }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* User bubble 2 */}
            <div className="flex justify-end">
              <div
                className="px-4 py-3 rounded-2xl rounded-tr-sm text-[14px] leading-relaxed max-w-[80%]"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                  boxShadow: "0 4px 24px rgba(59,130,246,0.2)",
                }}
              >
                Can you tell me more about the RAV4?
              </div>
            </div>

            {/* AI bubble 2 — detailed */}
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #4338ca)", boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div
                  className="rounded-2xl rounded-tl-sm px-5 py-5 text-[14px] text-white/80 space-y-4"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[16px] font-semibold text-white tracking-[-0.3px]">2024 Toyota RAV4</h3>
                      <p className="text-[12px] text-white/40 mt-0.5">LE · XLE · Adventure · TRD Off-Road · Limited</p>
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap flex-shrink-0"
                      style={{ background: "rgba(34,197,94,0.1)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" }}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      94% match
                    </div>
                  </div>

                  <p className="leading-relaxed text-white/70 text-[13px]">
                    The RAV4 is the best-selling SUV in America for good reason — it balances utility, efficiency, and legendary reliability. For 2 kids, the{" "}
                    <span className="text-white/90">37.6 cu ft of cargo space</span> behind rear seats handles everything from strollers to weekend trips.
                  </p>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className="rounded-xl p-3.5"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-[12px] font-semibold text-white/80">Reliability & Safety</span>
                      </div>
                      <div className="space-y-2.5">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1.5">
                            <span className="text-white/50">Consumer Reports</span>
                            <span className="font-semibold text-white/80">82/100</span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                            <div className="h-full rounded-full" style={{ width: "82%", background: "linear-gradient(90deg, #22c55e, #16a34a)" }} />
                          </div>
                        </div>
                        <span
                          className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(34,197,94,0.12)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" }}
                        >
                          IIHS Top Safety Pick+
                        </span>
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-3.5"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-[12px] font-semibold text-white/80">Market Price</span>
                      </div>
                      <p className="text-[22px] font-bold text-white tracking-[-0.5px]">$29,825</p>
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-white/35 mb-1.5 px-0.5">
                          <span>$27k</span>
                          <span className="text-blue-400/80">Fair range</span>
                          <span>$35k</span>
                        </div>
                        <div className="h-1.5 rounded-full relative overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                          <div className="absolute top-0 h-full rounded-full opacity-30" style={{ left: "15%", right: "25%", background: "#3b82f6" }} />
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
                            style={{ left: "20%", background: "#3b82f6", borderColor: "#0d1120", boxShadow: "0 0 8px #3b82f6" }}
                          />
                        </div>
                        <p className="text-[10px] text-white/40 mt-1.5">Currently <span className="text-emerald-400">below market average</span> in your area.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)" }}
                    >
                      View Local Inventory
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white/70 transition-all hover:text-white"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      Compare Trims
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-10 pb-5">
          <div
            className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
            style={{ background: "linear-gradient(to top, #0a0e1a 60%, transparent)" }}
          />
          <div className="max-w-2xl mx-auto relative z-10">
            {/* Quick chips */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              {["Compare trims", "Check market price", "Find near me", "Book test drive"].map((chip, i) => (
                <button
                  key={i}
                  className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-medium text-white/55 hover:text-white/90 transition-all flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input box */}
            <div className="relative group">
              <div
                className="absolute -inset-px rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.4), rgba(99,102,241,0.4))", filter: "blur(8px)" }}
              />
              <div
                className="relative flex items-end gap-2 px-3 py-2.5 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <textarea
                  className="flex-1 max-h-32 min-h-[36px] bg-transparent border-0 resize-none outline-none py-1.5 text-[14px] text-white placeholder:text-white/30 leading-relaxed"
                  placeholder="Ask anything about this car or search new..."
                  rows={1}
                />
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all flex-shrink-0 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)", boxShadow: "0 2px 12px rgba(59,130,246,0.4)" }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-center text-[10px] text-white/20 mt-2">
              CarBuddy AI uses live inventory data · Always verify details with the dealer
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel — Shortlist ── */}
      {rightPanelOpen && (
        <div
          className="relative z-10 w-[300px] flex-shrink-0 flex flex-col"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" style={{ filter: "drop-shadow(0 0 6px rgba(251,113,133,0.5))" }} />
              <span className="text-[13px] font-semibold text-white/90">My Shortlist</span>
            </div>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}
            >
              2 saved
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {[
              { name: "2024 Toyota RAV4 XLE", price: "$29,825", match: "94%", matchColor: "#3b82f6", specs: ["37 MPG", "AWD", "2.4 mi"], img: "/images/rav4.png" },
              { name: "2024 Honda CR-V EX", price: "$30,850", match: "88%", matchColor: "#22c55e", specs: ["34 MPG", "FWD", "5.1 mi"], img: "/images/crv.png" },
            ].map((car, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden cursor-pointer group"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={car.img}
                    alt={car.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  </button>
                  <div className="absolute bottom-2.5 left-2.5">
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md"
                      style={{
                        background: `${car.matchColor}22`,
                        color: car.matchColor,
                        border: `1px solid ${car.matchColor}44`,
                      }}
                    >
                      {car.match} match
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[13px] font-semibold text-white/90">{car.name}</p>
                  <p className="text-[15px] font-bold mt-0.5" style={{ color: car.matchColor }}>{car.price}</p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-white/40">
                    {car.specs.map((s, j) => (
                      <React.Fragment key={j}>
                        {j > 0 && <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />}
                        <span>{s}</span>
                      </React.Fragment>
                    ))}
                  </div>
                  <button
                    className="w-full mt-3.5 py-2 rounded-xl text-[12px] font-medium text-white/70 hover:text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
