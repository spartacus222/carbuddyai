import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Car,
  Search,
  X,
  ExternalLink,
  Gauge,
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  Database,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VehicleScoutPanel } from "@/components/VehicleScoutPanel";
import { useUserLocation } from "@/hooks/use-user-location";

interface VehicleListing {
  id: number;
  make: string;
  model: string;
  year: number;
  trim?: string;
  condition?: string;
  color?: string;
  price?: number;
  mileage?: number;
  dealerName?: string;
  dealerCity?: string;
  dealerState?: string;
  dealerPhone?: string;
  dealerWebsite?: string;
  sourceUrl?: string;
  sourceSite?: string;
  features?: string[];
  description?: string;
  scannedAt?: string;
}

function priceTag(price?: number) {
  if (!price) return { label: "Call", color: "text-white/40", bg: "" };
  if (price < 20000) return { label: `$${price.toLocaleString()}`, color: "text-green-400", bg: "bg-green-400/10" };
  if (price < 30000) return { label: `$${price.toLocaleString()}`, color: "text-blue-400", bg: "bg-blue-400/10" };
  return { label: `$${price.toLocaleString()}`, color: "text-orange-400", bg: "bg-orange-400/10" };
}

export default function Listings() {
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [agentOpen, setAgentOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<VehicleListing | null>(null);
  const { location } = useUserLocation();

  const fetchListings = async (q?: string) => {
    setLoading(true);
    try {
      const url = q && q.trim()
        ? `/api/vehicle-listings?q=${encodeURIComponent(q.trim())}`
        : "/api/vehicle-listings";
      const res = await fetch(url);
      if (res.ok) setListings(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchListings(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this listing?")) return;
    await fetch(`/api/vehicle-listings/${id}`, { method: "DELETE" });
    setListings((prev) => prev.filter((l) => l.id !== id));
    if (selectedListing?.id === id) setSelectedListing(null);
  };

  return (
    <div className="min-h-screen bg-[#080b14] text-white flex flex-col">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute rounded-full opacity-[0.04] blur-[130px] w-[600px] h-[600px] -top-[100px] left-[50px] bg-emerald-600" />
        <div className="absolute rounded-full opacity-[0.03] blur-[120px] w-[400px] h-[400px] bottom-0 right-[100px] bg-blue-600" />
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
        style={{ background: "rgba(8,11,20,0.9)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>
          <div className="w-px h-5 bg-white/[0.08]" />
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #059669, #2563eb)" }}
            >
              <Car className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Vehicle Listings Database</h1>
              <p className="text-[10px] text-white/35">{listings.length} listings discovered by agents</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              type="text"
              placeholder="Search make, model, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/40 focus:bg-white/[0.06] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            onClick={() => setAgentOpen(true)}
            className="h-9 text-sm gap-2"
            style={{ background: "linear-gradient(135deg, #059669, #2563eb)" }}
          >
            <Sparkles className="w-4 h-4" />
            Scout Listings
          </Button>
        </div>
      </header>

      <div className="flex flex-1 relative z-10">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Mobile search */}
          <div className="relative sm:hidden mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              type="text"
              placeholder="Search make, model, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.2)" }}
              >
                <Car className="w-8 h-8 text-emerald-500/60" />
              </div>
              <h3 className="text-base font-semibold text-white/70 mb-2">
                {search ? "No listings match your search" : "No listings discovered yet"}
              </h3>
              <p className="text-sm text-white/35 max-w-xs mb-6">
                {search
                  ? "Try a different make, model, or location."
                  : "Use the Vehicle Scout Agent to search the web for real car listings and build your database."}
              </p>
              {!search && (
                <Button
                  onClick={() => setAgentOpen(true)}
                  style={{ background: "linear-gradient(135deg, #059669, #2563eb)" }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Scouting
                </Button>
              )}
            </div>
          )}

          {!loading && listings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {listings.map((listing) => {
                const pt = priceTag(listing.price);
                const isSelected = selectedListing?.id === listing.id;
                return (
                  <div
                    key={listing.id}
                    onClick={() => setSelectedListing(isSelected ? null : listing)}
                    className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01]"
                    style={{
                      background: isSelected
                        ? "rgba(5,150,105,0.08)"
                        : "rgba(255,255,255,0.025)",
                      border: `1px solid ${isSelected ? "rgba(5,150,105,0.35)" : "rgba(255,255,255,0.07)"}`,
                    }}
                  >
                    {/* Card top — price + source */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <div className={`text-lg font-bold ${pt.color}`}>
                        {pt.label}
                      </div>
                      <div className="flex items-center gap-2">
                        {listing.sourceSite && (
                          <Badge variant="glass" className="text-[9px] px-2">
                            {listing.sourceSite}
                          </Badge>
                        )}
                        {listing.condition && (
                          <Badge variant="outline" className="text-[9px] px-2 border-white/10 text-white/40">
                            {listing.condition}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="px-4 pb-3">
                      <h3 className="text-base font-semibold text-white/90">
                        {listing.year} {listing.make} {listing.model}
                        {listing.trim && (
                          <span className="text-white/45 font-normal text-sm"> {listing.trim}</span>
                        )}
                      </h3>
                      {listing.color && (
                        <p className="text-[11px] text-white/35 mt-0.5">{listing.color}</p>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 px-4 pb-3">
                      {listing.mileage != null && (
                        <span className="flex items-center gap-1 text-[11px] text-white/40">
                          <Gauge className="w-3 h-3" />
                          {listing.mileage.toLocaleString()} mi
                        </span>
                      )}
                      {listing.year && (
                        <span className="flex items-center gap-1 text-[11px] text-white/40">
                          <Calendar className="w-3 h-3" />
                          {listing.year}
                        </span>
                      )}
                      {(listing.dealerCity || listing.dealerState) && (
                        <span className="flex items-center gap-1 text-[11px] text-white/40 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {[listing.dealerCity, listing.dealerState].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </div>

                    {/* Dealer */}
                    {listing.dealerName && (
                      <div className="px-4 pb-3">
                        <p className="text-[11px] text-white/35 truncate">{listing.dealerName}</p>
                      </div>
                    )}

                    {/* Expanded detail */}
                    {isSelected && (
                      <div className="border-t border-white/[0.06] px-4 py-3 space-y-3">
                        {listing.description && (
                          <p className="text-[11px] text-white/50 leading-relaxed">{listing.description}</p>
                        )}
                        {listing.features && listing.features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {listing.features.slice(0, 6).map((f, i) => (
                              <Badge key={i} variant="glass" className="text-[9px]">{f}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {listing.sourceUrl && (
                            <a
                              href={listing.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/60 hover:text-white hover:bg-white/[0.07] transition-all"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Listing
                            </a>
                          )}
                          {listing.dealerWebsite && (
                            <a
                              href={listing.dealerWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/60 hover:text-white hover:bg-white/[0.07] transition-all"
                            >
                              <Car className="w-3 h-3" />
                              Dealer Site
                            </a>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(listing.id); }}
                            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-red-500/[0.08] border border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.12] transition-all ml-auto"
                          >
                            <X className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Vehicle Scout Agent side panel */}
        {agentOpen && (
          <div className="fixed inset-0 z-50 flex items-stretch justify-end pointer-events-none">
            <div
              className="w-full max-w-sm h-full pointer-events-auto shadow-2xl"
              style={{ background: "rgba(8,11,20,0.0)" }}
            >
              <VehicleScoutPanel
                onClose={() => { setAgentOpen(false); fetchListings(search); }}
                defaultLocation={location.label}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
